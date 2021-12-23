import { AuthGuardJwt } from './../auth/auth-guard.jwt';
import { User } from 'src/auth/user.entity';
import { ListEvent } from './input/list.event';
import { EventService } from './event.service';
import { Attendee } from './../entities/attendee.entity';
import { Event } from './../entities/event.entity';
import { Body, ClassSerializerInterceptor, Controller, Delete, ForbiddenException, Get, HttpCode, Injectable, Logger, NotFoundException, Param, ParseIntPipe, Patch, Post, Query, SerializeOptions, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEventDto } from './input/create-event.dto';
import { UpdateEventDto } from './input/update-event.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';


@Controller('/event')
@SerializeOptions({ strategy: 'excludeAll'})
export class EventController {
    private readonly logger = new Logger(EventController.name);

    constructor(
        // @InjectRepository(Event)
        // private readonly repository: Repository<Event>,
        // @InjectRepository(Attendee)
        // private readonly attendeeRepository: Repository<Attendee>,
        private readonly eventService: EventService
    ) {
    }

    @Get()
    @UsePipes(new ValidationPipe({transform: true}))
    @UseInterceptors(ClassSerializerInterceptor)
    async findAll(@Query() filter: ListEvent) {
        const events = await this.eventService
        .getEventsWithAttendeeCountFilteredPaginated(
            filter,
            {
                total: true,
                currentPage: filter.page,
                limit: 10
            }
            );
        return events;
    }

    @Get('practice')
    async practice() {
        // return await this.repository.findOne(1, 
        // {
        //     relations: ['attendees']
        // });
        // const event = await this.repository.findOne(1);
        // const event = new Event();
        // event.id = 1;

        // const attendee = new Attendee();
        // attendee.name = 'Jerry The Second';
        // attendee.event = event;

        // await this.attendeeRepository.save(attendee);

        // return event;

        // return await this.repository.createQueryBuilder('e')
        // .select(['e.id', 'e.name'])
        // .orderBy('e.id', 'ASC')
        // .take(3)
        // .getMany();
    }

    @Get(':id')
    @UseInterceptors(ClassSerializerInterceptor)
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const event = await this.eventService.getEventWithAttendeeCount(id);

        if (!event) {
            throw new NotFoundException();
        }

        return event;
    }

    @Post()
    @UseGuards(AuthGuardJwt)
    @UseInterceptors(ClassSerializerInterceptor)
    async create(
        @Body() input: CreateEventDto,
        @CurrentUser() user: User) {
        return await this.eventService.createEvent(input, user)
    }

    @Patch(':id')
    @UseGuards(AuthGuardJwt)
    @UseInterceptors(ClassSerializerInterceptor)
    async update(@Param('id', ParseIntPipe) id:number , 
    @Body() input: UpdateEventDto,
    @CurrentUser() user: User) {
        const event = await this.eventService.findOne(id);

        if (!event) {
            throw new NotFoundException();
        }

        if (event.organizerId !== user.id) {
            throw new ForbiddenException(
                null, 'You are not authorized to change this event'
                );
        }

        {
            return await this.eventService.updateEvent(event, input);
        }
    }

    @Delete(':id')
    @UseGuards(AuthGuardJwt)
    @HttpCode(204)
    async remove(@Param('id', ParseIntPipe) id,
    @CurrentUser() user: User) {
        const event = await this.eventService.findOne(id);

        if (!event) {
            throw new NotFoundException();
        }

        if (event.organizerId !== user.id) {
            throw new ForbiddenException(
                null, 'You are not authorized to remove this event'
                );
        }

        await this.eventService.deleteEvent(id);
    }
}