import { Attendee } from './../entities/attendee.entity';
import { Event } from './../entities/event.entity';
import { UpdateEventDto } from './../dto/update-event.dto';
import { CreateEventDto } from './../dto/create-event.dto';
import { Body, Controller, Delete, Get, HttpCode, Injectable, Logger, NotFoundException, Param, Patch, Post, ValidationPipe } from "@nestjs/common";
import { filter } from 'rxjs';
import { parse } from 'path';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';


@Controller('/events')
export class EventController {
    private readonly logger = new Logger(EventController.name);

    constructor(
        @InjectRepository(Event)
        private readonly repository: Repository<Event>,
        @InjectRepository(Attendee)
        private readonly attendeeRepository: Repository<Attendee>
    ) {
    }

    @Get()
    async findAll() {
        this.logger.log(`Hit the findAll route`);
        const events = await this.repository.find();
        this.logger.debug(`Found ${events.length} events`);
        return events;
    }

    @Get('practice')
    async practice() {
        // return await this.repository.findOne(1, 
        // {
        //     relations: ['attendees']
        // });
        // const event = await this.repository.findOne(1);
        const event = new Event();
        event.id = 1;

        const attendee = new Attendee();
        attendee.name = 'Jerry The Second';
        attendee.event = event;

        await this.attendeeRepository.save(attendee);

        return event;
    }

    @Get(':id')
    async findOne(@Param('id') id) {
        const event = await this.repository.findOne(id);

        if (!event) {
            throw new NotFoundException();
        }

        return event;
    }

    @Post()
    async create(@Body() input: CreateEventDto) {
        return await this.repository.save({
            ...input,
            when: new Date(input.when)
        });
    }

    @Patch(':id')
    async update(@Param('id') id:number , @Body() input: UpdateEventDto) {
        const event = await this.repository.findOne(id);

        if (!event) {
            throw new NotFoundException();
        }

        return event;

        {
            return await this.repository.save({
            ...event,
            ...input,
            when: input.when ? new Date(input.when) : event.when
            })
        }
    }

    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id') id) {
        const event = await this.repository.findOne(id);

        if (!event) {
            throw new NotFoundException();
        }

        return event;

        await this.repository.remove(event);
    }
}