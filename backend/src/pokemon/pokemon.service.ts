import { Injectable } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PokemonService {
  constructor(private prisma: PrismaService) {}
  async create(createPokemonDto: CreatePokemonDto) {
    return await this.prisma.pokemon.create({
      data: createPokemonDto,
    });
  }

  async findAll() {
    return await this.prisma.pokemon.findMany({
      include: {
        types: {
          include: {
            type: true
          }
        }
      }
    });
  }

  async findOne(number: number) {
    return await this.prisma.pokemon.findUnique({
      where: { number },
      include: {
        types: {
          include: {
            type: true
          }
        }
      }
    });
  }

  async update(number: number, updatePokemonDto: UpdatePokemonDto) {
    return await this.prisma.pokemon.update({
      where: { number },
      data: updatePokemonDto,
      include: {
        types: {
          include: {
            type: true
          }
        }
      }
    });
  }

  async remove(number: number) {
    return await this.prisma.pokemon.delete({
      where: { number },
    });
  }

  async fetchFromPokeAPI(number: number) {
    // Fetch data from PokeAPI
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${number}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon #${number} from PokeAPI`);
    }

    const data = await response.json();

    // Transform API response to match our DTO
    const pokemonData = {
      number: data.id,
      name: data.name,
      imageUrl: data.sprites.front_default,
    };

    // Save to database using our existing create method
    return await this.create(pokemonData);
  }
}
