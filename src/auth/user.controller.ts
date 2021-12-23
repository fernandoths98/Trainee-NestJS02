import { User } from 'src/auth/user.entity';
import { CreateUserDto } from './input/create.user.dto';
import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { use } from 'passport';

@Controller('users')
export class UserController {
    constructor(
        private readonly authService: AuthService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){

    }

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        const user = new User();

        if (createUserDto.password !== createUserDto.retypedPassword) {
            throw new BadRequestException(['Password are not identical'])
            
        }

        const existingUser = await this.userRepository.findOne({
            where: [
                {username: createUserDto.username},
                {email: createUserDto.email}
            ]
        });

        if (existingUser) {
            throw new BadRequestException(['username or email is already taken']);
        }

        user.username = createUserDto.username;
        user.password = await this.authService.hashPassword(createUserDto.password);
        user.email = createUserDto.email;
        user.firstname = createUserDto.firstName;
        user.lastname = createUserDto.lastName;

        return {
            ...(await this.userRepository.save(user)),
            token: this.authService.getTokenForUser(user)
        }
    }
}