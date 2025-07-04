import { supabase } from "@/lib/supabaseClient";
import type { Event } from "@/types/event";
import type { ProspectCard } from "@/types/card";

export const eventsApi = {
  /**
   * Get all events for a school
   */
  async getEvents(schoolId?: string): Promise<Event[]> {
    let query = supabase
      .from("events")
      .select("*, school_id")
      .order("date", { ascending: false });

    if (schoolId) {
      query = query.eq("school_id", schoolId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get reviewed data (cards) - excluding deleted cards
   */
  async getReviewedData(schoolId?: string): Promise<ProspectCard[]> {
    let query = supabase
      .from("reviewed_data")
      .select("*")
      .neq("review_status", "deleted");

    if (schoolId) {
      query = query.eq("school_id", schoolId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch reviewed data: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Create a new event
   */
  async createEvent(
    eventData: Omit<Event, "id" | "created_at" | "updated_at">
  ): Promise<Event> {
    const { data, error } = await supabase
      .from("events")
      .insert(eventData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }

    return data;
  },

  /**
   * Update an event
   */
  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    const { data, error } = await supabase
      .from("events")
      .update(eventData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }

    return data;
  },

  /**
   * Archive an event
   */
  async archiveEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from("events")
      .update({ status: "archived" })
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to archive event: ${error.message}`);
    }
  },

  /**
   * Archive cards for an event
   */
  async archiveEventCards(eventId: string): Promise<void> {
    const { error } = await supabase
      .from("reviewed_data")
      .update({ status: "archived" })
      .eq("event_id", eventId)
      .neq("status", "archived");

    if (error) {
      throw new Error(`Failed to archive event cards: ${error.message}`);
    }
  },
};
