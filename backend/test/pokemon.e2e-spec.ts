import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Pokemon API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /pokemon', () => {
    it('should return an array of Pokemon', async () => {
      const response = await request(app.getHttpServer())
        .get('/pokemon')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should include types for each Pokemon', async () => {
      const response = await request(app.getHttpServer())
        .get('/pokemon')
        .expect(200);

      const firstPokemon = response.body[0];
      expect(firstPokemon).toHaveProperty('types');
      expect(Array.isArray(firstPokemon.types)).toBe(true);
    });
  });

  describe('GET /pokemon/:number', () => {
    it('should return Pikachu when requesting Pokemon #25', async () => {
      const response = await request(app.getHttpServer())
        .get('/pokemon/25')
        .expect(200);

      expect(response.body.number).toBe(25);
      expect(response.body.name).toBe('pikachu');
    });

    it('should include types for Pikachu', async () => {
      const response = await request(app.getHttpServer())
        .get('/pokemon/25')
        .expect(200);

      expect(response.body.types).toBeDefined();
      expect(Array.isArray(response.body.types)).toBe(true);
      expect(response.body.types.length).toBeGreaterThan(0);

      // Pikachu should be electric type
      const electricType = response.body.types.find(
        (t: any) => t.type.name === 'electric'
      );
      expect(electricType).toBeDefined();
    });

    it('should return empty response for non-existent Pokemon', async () => {
      const response = await request(app.getHttpServer())
        .get('/pokemon/999')
        .expect(200);

      // NestJS returns empty body when findUnique returns null
      expect(response.body).toEqual({});
    });
  });

  describe('PATCH /pokemon/:number', () => {
    it('should update caught status to true', async () => {
      const response = await request(app.getHttpServer())
        .patch('/pokemon/25')
        .send({ caught: true })
        .expect(200);

      expect(response.body.caught).toBe(true);
    });

    it('should update seen status to true', async () => {
      const response = await request(app.getHttpServer())
        .patch('/pokemon/1')
        .send({ seen: true })
        .expect(200);

      expect(response.body.seen).toBe(true);
    });

    it('should update both caught and seen status', async () => {
      const response = await request(app.getHttpServer())
        .patch('/pokemon/4')
        .send({ caught: true, seen: true })
        .expect(200);

      expect(response.body.caught).toBe(true);
      expect(response.body.seen).toBe(true);
    });
  });
});
