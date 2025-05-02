// src/subjects/subjects.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path if needed
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject } from '@prisma/client'; // Import the generated Subject type

@Injectable()
export class SubjectsService {
  // Inject PrismaService through the constructor
  constructor(private prisma: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    // Use prisma client to create a new subject record
    // Prisma automatically maps DTO fields to the correct model fields
    // (assuming DTO field names match model field names like 'name', 'code', 'semester')
    try {
      const newSubject = await this.prisma.subject.create({
        data: createSubjectDto,
      });
      return newSubject;
    } catch (error) {
      // Handle potential errors, e.g., unique constraint violation if code must be unique
      // You might want more specific error handling here
      console.error('Error creating subject:', error);
      throw error; // Re-throw or handle appropriately
    }
  }

  async findAll(): Promise<Subject[]> {
    // Use prisma client to find all subject records
    return this.prisma.subject.findMany();
    // You can add options like ordering:
    // return this.prisma.subject.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number): Promise<Subject> {
    const subject = await this.prisma.subject.findUnique({
      where: {
        id: id,
      },
    });

    // === CHECK FOR NULL HERE ===
    if (!subject) {
      // If subject is null (not found), throw the NestJS exception
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
    // === END CHECK ===

    // If we reach here, 'subject' is guaranteed to be a non-null Subject object
    return subject;
  }

  async update(
    id: number,
    updateSubjectDto: UpdateSubjectDto,
  ): Promise<Subject> {
    // Check if the subject exists first (optional but good practice for clear errors)
    const subjectExists = await this.prisma.subject.findUnique({
      where: { id },
    });
    if (!subjectExists) {
      throw new NotFoundException(
        `Subject with ID ${id} not found. Cannot update.`,
      );
    }

    // Use prisma client to update the subject record
    try {
      return await this.prisma.subject.update({
        where: {
          id: id,
        },
        data: updateSubjectDto, // Pass the DTO data for updates
      });
    } catch (error) {
      // Handle potential errors during update
      console.error('Error updating subject:', error);
      // Prisma might throw P2025 if the record disappeared between the check and update,
      // although our initial check makes this less likely.
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Subject with ID ${id} not found during update attempt.`,
        );
      }
      throw error;
    }
  }

  async remove(id: number): Promise<Subject> {
    // Check if the subject exists first (optional, Prisma's delete throws if not found)
    const subjectExists = await this.prisma.subject.findUnique({
      where: { id },
    });
    if (!subjectExists) {
      throw new NotFoundException(
        `Subject with ID ${id} not found. Cannot remove.`,
      );
    }

    // Use prisma client to delete the subject record
    try {
      return await this.prisma.subject.delete({
        where: {
          id: id,
        },
      });
    } catch (error) {
      // Handle potential errors during delete
      console.error('Error removing subject:', error);
      // Prisma throws P2025 RecordNotFound if the record is already gone.
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Subject with ID ${id} not found during removal attempt.`,
        );
      }
      // Handle other errors, e.g., foreign key constraints if NRCs depend on this Subject
      // if (error.code === 'P2003') { /* Foreign key constraint failed */ }
      throw error;
    }
  }
}
