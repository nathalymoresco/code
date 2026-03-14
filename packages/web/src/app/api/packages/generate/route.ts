import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { GeneratePackageInput, ComfortLevel } from '@travelmatch/shared';

const MARKUP_PERCENTAGE = 15;
const INSURANCE_DAILY_RATE = 12; // R$ per person per day

// Comfort level → price_range mapping
const COMFORT_TO_PRICE: Record<ComfortLevel, string[]> = {
  economico: ['economico'],
  conforto: ['economico', 'moderado'],
  premium: ['moderado', 'premium'],
};

// Time slots for itinerary
const TIME_SLOTS = {
  transfer_arrival: { start: '10:00', end: '12:00' },
  checkin: { start: '14:00', end: '15:00' },
  morning_activity: { start: '08:00', end: '12:00' },
  afternoon_activity: { start: '14:00', end: '17:00' },
  lunch: { start: '12:00', end: '13:30' },
  dinner: { start: '19:00', end: '21:00' },
  checkout: { start: '10:00', end: '11:00' },
  transfer_departure: { start: '14:00', end: '16:00' },
};

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0]!;
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / (86400 * 1000));
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body: GeneratePackageInput = await request.json();
    const { destination_id, start_date, end_date, num_travelers, comfort_level } = body;

    if (!destination_id || !start_date || !end_date || !num_travelers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const totalDays = daysBetween(start_date, end_date);
    if (totalDays < 1 || totalDays > 30) {
      return NextResponse.json({ error: 'Invalid date range (1-30 days)' }, { status: 400 });
    }

    // Fetch destination
    const { data: destination } = await supabase
      .from('destinations')
      .select('id, name')
      .eq('id', destination_id)
      .eq('is_active', true)
      .single();

    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
    }

    // Get user DNA for personalization
    const { data: dnaProfile } = await supabase
      .from('dna_profiles')
      .select('dimensions, completeness_percentage')
      .eq('profile_id', profile.id)
      .single();

    const dimensions = dnaProfile?.dimensions as Record<string, number> | null;

    // Fetch available partners by type
    const priceRanges = COMFORT_TO_PRICE[comfort_level] ?? ['moderado'];

    const { data: allPartners } = await supabase
      .from('partners')
      .select('id, name, type, description, daily_rate, price_range, amenities, latitude, longitude')
      .eq('destination_id', destination_id)
      .eq('is_curated', true)
      .eq('contract_status', 'active');

    const partners = allPartners ?? [];

    // Categorize partners
    const accommodations = partners
      .filter((p) => ['hotel', 'pousada', 'airbnb'].includes(p.type))
      .filter((p) => !p.price_range || priceRanges.includes(p.price_range));
    const activities = partners.filter((p) => ['guia', 'experiencia'].includes(p.type));
    const restaurants = partners.filter((p) => p.type === 'restaurante');
    const transfers = partners.filter((p) => p.type === 'transfer');

    // Select accommodation based on DNA
    let selectedAccom = accommodations[0];
    if (dimensions && accommodations.length > 1) {
      // Introvert → prefer pousada/airbnb; social → prefer hotel
      const isSocial = (dimensions.sociabilidade ?? 50) > 65;
      selectedAccom = accommodations.find((a) =>
        isSocial ? a.type === 'hotel' : ['pousada', 'airbnb'].includes(a.type),
      ) ?? accommodations[0];
    }

    // Distribute activities by ritmo
    const ritmo = dimensions?.ritmo ?? 50;
    const activitiesPerDay = ritmo > 70 ? 2 : ritmo > 40 ? 1 : 1;

    // Build items
    type ItemInsert = {
      type: string;
      title: string;
      description: string | null;
      date: string;
      start_time: string | null;
      end_time: string | null;
      price: number;
      day_number: number;
      sort_order: number;
      is_removable: boolean;
      partner_id: string | null;
    };

    const items: ItemInsert[] = [];
    let totalPrice = 0;

    // Day 1: Transfer arrival + check-in
    const transferIn = transfers[0];
    if (transferIn) {
      const price = (transferIn.daily_rate ?? 80) * num_travelers;
      items.push({
        type: 'transfer',
        title: `Transfer: Aeroporto → ${destination.name}`,
        description: transferIn.name,
        date: start_date,
        start_time: TIME_SLOTS.transfer_arrival.start,
        end_time: TIME_SLOTS.transfer_arrival.end,
        price,
        day_number: 1,
        sort_order: 1,
        is_removable: false,
        partner_id: transferIn.id,
      });
      totalPrice += price;
    }

    // Accommodation for all nights
    if (selectedAccom) {
      const nightlyRate = (selectedAccom.daily_rate ?? 200) * num_travelers;
      for (let day = 1; day <= totalDays; day++) {
        const date = addDays(start_date, day - 1);
        items.push({
          type: 'hospedagem',
          title: day === 1
            ? `Check-in: ${selectedAccom.name}`
            : day === totalDays
              ? `Check-out: ${selectedAccom.name}`
              : `${selectedAccom.name}`,
          description: selectedAccom.description,
          date,
          start_time: day === 1 ? TIME_SLOTS.checkin.start : null,
          end_time: day === totalDays ? TIME_SLOTS.checkout.end : null,
          price: day === totalDays ? 0 : nightlyRate, // Last day = checkout, no charge
          day_number: day,
          sort_order: day === 1 ? 2 : 0,
          is_removable: false,
          partner_id: selectedAccom.id,
        });
        if (day < totalDays) totalPrice += nightlyRate;
      }
    }

    // Activities for middle days (day 2 to day N-1)
    let activityIdx = 0;
    for (let day = 2; day < totalDays; day++) {
      const date = addDays(start_date, day - 1);

      for (let slot = 0; slot < activitiesPerDay && activityIdx < activities.length; slot++) {
        const activity = activities[activityIdx % activities.length]!;
        const isMorning = slot === 0;
        const timeSlot = isMorning ? TIME_SLOTS.morning_activity : TIME_SLOTS.afternoon_activity;
        const price = (activity.daily_rate ?? 100) * num_travelers;

        items.push({
          type: activity.type === 'guia' ? 'passeio' : 'experiencia',
          title: activity.name,
          description: activity.description,
          date,
          start_time: timeSlot.start,
          end_time: timeSlot.end,
          price,
          day_number: day,
          sort_order: isMorning ? 1 : 3,
          is_removable: true,
          partner_id: activity.id,
        });
        totalPrice += price;
        activityIdx++;
      }

      // Lunch on activity days
      const restaurant = restaurants[day % Math.max(restaurants.length, 1)];
      if (restaurant) {
        const price = (restaurant.daily_rate ?? 50) * num_travelers;
        items.push({
          type: 'alimentacao',
          title: `Almoço: ${restaurant.name}`,
          description: restaurant.description,
          date,
          start_time: TIME_SLOTS.lunch.start,
          end_time: TIME_SLOTS.lunch.end,
          price,
          day_number: day,
          sort_order: 2,
          is_removable: true,
          partner_id: restaurant.id,
        });
        totalPrice += price;
      }
    }

    // Last day: Transfer departure
    if (transferIn) {
      const price = (transferIn.daily_rate ?? 80) * num_travelers;
      items.push({
        type: 'transfer',
        title: `Transfer: ${destination.name} → Aeroporto`,
        description: transferIn.name,
        date: addDays(start_date, totalDays - 1),
        start_time: TIME_SLOTS.transfer_departure.start,
        end_time: TIME_SLOTS.transfer_departure.end,
        price,
        day_number: totalDays,
        sort_order: 5,
        is_removable: false,
        partner_id: transferIn.id,
      });
      totalPrice += price;
    }

    // Insurance
    const insuranceTotal = INSURANCE_DAILY_RATE * num_travelers * totalDays;
    items.push({
      type: 'seguro',
      title: 'Seguro Viagem Básico',
      description: 'Cancelamento, emergência médica, bagagem',
      date: start_date,
      start_time: null,
      end_time: null,
      price: insuranceTotal,
      day_number: 1,
      sort_order: 0,
      is_removable: false,
      partner_id: null,
    });
    totalPrice += insuranceTotal;

    // Apply markup
    const markup = totalPrice * (MARKUP_PERCENTAGE / 100);
    const finalPrice = Math.round((totalPrice + markup) * 100) / 100;

    // Get compatibility score
    let compatScore = 50;
    if (dnaProfile?.completeness_percentage) {
      const { data: match } = await supabase.rpc('match_destinations', {
        query_vector: `[${Object.values(dimensions ?? {}).join(',')}]`,
        match_count: 1,
        completeness: dnaProfile.completeness_percentage,
      });
      if (match?.[0]) {
        compatScore = (match[0] as { raw_score: number }).raw_score;
      }
    }

    // Create package
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .insert({
        profile_id: profile.id,
        destination_id,
        status: 'draft',
        total_price: finalPrice,
        markup_percentage: MARKUP_PERCENTAGE,
        start_date,
        end_date,
        num_travelers,
        comfort_level,
        compatibility_score: compatScore,
        insurance_included: true,
      })
      .select('id')
      .single();

    if (pkgError || !pkg) {
      return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
    }

    // Insert items
    const itemsToInsert = items.map((item) => ({
      ...item,
      package_id: pkg.id,
    }));

    const { error: itemsError } = await supabase
      .from('package_items')
      .insert(itemsToInsert);

    if (itemsError) {
      return NextResponse.json({ error: 'Failed to create package items' }, { status: 500 });
    }

    // Fetch back the inserted items
    const { data: insertedItems } = await supabase
      .from('package_items')
      .select('*')
      .eq('package_id', pkg.id)
      .order('day_number')
      .order('sort_order');

    return NextResponse.json({
      package_id: pkg.id,
      items: insertedItems ?? [],
      total_price: finalPrice,
      compatibility_score: compatScore,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
