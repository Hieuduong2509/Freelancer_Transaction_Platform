import * as eventRepository from "../repositories/event.repository.js";

/*
Arg:
     fastify instance.
Return:
     Đăng ký GET /events.
*/

export async function registerAnalyticsEventsRoutes(fastify) {
  fastify.get("/events", async (request) => {
    const { event_type: eventType, limit } = request.query;
    return eventRepository.findEvents({
      eventType: eventType || null,
      limit,
    });
  });
}
