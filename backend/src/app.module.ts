import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { PokemonModule } from './pokemon/pokemon.module';

@Module({
  imports: [PokemonModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
