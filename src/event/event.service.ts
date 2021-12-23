import { UpdateEventDto } from './input/update-event.dto';
import { User } from 'src/auth/user.entity';
import { paginate, PaginateOptions, PaginationResult } from './../pagination/paginator';
import { ListEvent, WhenEventFilter } from './input/list.event';
import { filter } from 'rxjs';
import { AttendeeAnswerEnum } from './../entities/attendee.entity';
import { Injectable, Logger } from '@nestjs/common';
import { Event, PaginatedEvents } from './../entities/event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateEventDto } from './input/create-event.dto';

@Injectable()
export class EventService {
    private readonly logger = new Logger(EventService.name);

    constructor(
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>
    ){

    }

    private getEventBaseQuery(): SelectQueryBuilder<Event> {
        return this.eventRepository
        .createQueryBuilder('e')
        .orderBy('e.id', 'DESC');
    }

    public getEventWithAttendeeCountQuery(): SelectQueryBuilder<Event> {
        return this.getEventBaseQuery()
        .loadRelationCountAndMap(
            'e.attendeeCount', 
            'e.attendees'
        )
        .loadRelationCountAndMap (
            'e.attendeeAccepted',
            'e.attendees',
            'attendee',
            (qb) => qb
            .where('attendee.answer = :answer',
            {
                answer : AttendeeAnswerEnum.Accepted
            })
        )
        .loadRelationCountAndMap (
            'e.attendeeMaybe',
            'e.attendees',
            'attendee',
            (qb) => qb
            .where('attendee.answer = :answer',
            {
                answer : AttendeeAnswerEnum.Maybe
            })
        )
        .loadRelationCountAndMap (
            'e.attendeeRejected',
            'e.attendees',
            'attendee',
            (qb) => qb
            .where('attendee.answer = :answer',
            {
                answer : AttendeeAnswerEnum.Rejected
            })
        )
    }

    private getEventsWithAttendeeCountFilteredQuery
    (filter?: ListEvent) : SelectQueryBuilder<Event> {
        let query = this.getEventWithAttendeeCountQuery();

        if (!filter) {
            return query;
        }

        if (!filter.when) {
            if (filter.when == WhenEventFilter.Today) {
                query = query.andWhere(
                    `e.when >= CURDATE() AND e.when <= CURDATE() + INTERVAL 1 DAY`
                );   
            }
            
            if (filter.when == WhenEventFilter.Tomorrow) {
                query = query.andWhere(
                    `e.when >= CURDATE() + INTERVAL 1 DAY AND e.when <= CURDATE() + INTERVAL 2 DAY`
                );   
            }

            if (filter.when == WhenEventFilter.ThisWeek) {
                query = query.andWhere('YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1)' )
            }

            if (filter.when == WhenEventFilter.NextWeek) {
                query = query.andWhere('YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1) + 1' )
            }
        }

        return query;
    }

    public async getEventsWithAttendeeCountFilteredPaginated (
        filter: ListEvent,
        paginateOptions: PaginateOptions
    ): Promise<PaginatedEvents>{
        return await paginate(
            await this.getEventsWithAttendeeCountFilteredQuery(filter), 
            paginateOptions
        );
    }

    public async getEventWithAttendeeCount(id: number): Promise<Event | undefined> {
        const query =  this.getEventWithAttendeeCountQuery()
        .andWhere('e.id = :id', {id});
        
        this.logger.debug(query.getSql());

        return await query.getOne();
    }

    public async findOne(id: number) : Promise<Event | undefined> {
        return await this.eventRepository.findOne(id);
    }

    public async createEvent(input: CreateEventDto, user: User) : Promise<Event> {
        return await this.eventRepository.save(
            new Event({
                ...event,
                ...input,
                when: new Date(input.when)
            })
        )
    }

    public async updateEvent(event: Event, input: UpdateEventDto) : Promise<Event> {
        return await this.eventRepository.save(new Event({
            ...event,
            ...input,
            when: new Date(input.when)
        }))
    }

    public async deleteEvent(id: number): Promise<DeleteResult> {
        return await this.eventRepository
        .createQueryBuilder('e')
        .delete()
        .where('id = : id' , {id})
        .execute();
    }

    public async getEventsOrganizedByUserIdPaginated(
        userId: number, paginateOptions: PaginateOptions
      ): Promise<PaginatedEvents> {
        return await paginate<Event>(
          this.getEventsOrganizedByUserIdQuery(userId),
          paginateOptions
        );
      }

    private getEventsOrganizedByUserIdQuery (
        userId: number
    ): SelectQueryBuilder<Event> {
        return this.getEventBaseQuery()
        .where('e.organizerId = :userId', { userId});
    }

    public async getEventsAttendedByUserIdPaginated(
    userId: number, paginateOptions: PaginateOptions
  ): Promise<PaginatedEvents> {
    return await paginate<Event>(
      this.getEventsAttendedByUserIdQuery(userId),
      paginateOptions
    );
  }

  private getEventsAttendedByUserIdQuery(
    userId: number
  ): SelectQueryBuilder<Event> {
    return this.getEventBaseQuery()
      .leftJoinAndSelect('e.attendees', 'a')
      .where('a.userId = :userId', { userId });
  }
}