// src/subjects/subjects.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe, // Use ParseIntPipe for ID validation/conversion
  NotFoundException, // Import if needed for explicit handling, though service throws now
  HttpCode, // Optional: Set specific HTTP codes (e.g., 204 for delete)
  HttpStatus,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service'; // Corrected spelling
import { CreateSubjectDto } from './dto/create-subject.dto'; // Corrected spelling
import { UpdateSubjectDto } from './dto/update-subject.dto'; // Corrected spelling
import { Subject } from '@prisma/client'; // Import type for better typing, optional

@Controller('subjects') // Corrected spelling
export class SubjectsController {
  // Corrected spelling
  constructor(private readonly subjectsService: SubjectsService) {} // Corrected spelling

  @Post()
  async create(@Body() createSubjectDto: CreateSubjectDto): Promise<Subject> {
    // Return Promise<Subject>
    // DTO validation is handled by ValidationPipe (if enabled globally)
    return this.subjectsService.create(createSubjectDto);
  }

  @Get()
  async findAll(): Promise<Subject[]> {
    // Return Promise<Subject[]>
    return this.subjectsService.findAll();
  }

  @Get(':id')
  // Use ParseIntPipe to automatically convert 'id' string to number and validate
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Subject> {
    // Return Promise<Subject>
    // Service now throws NotFoundException if not found, NestJS handles it
    return this.subjectsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ): Promise<Subject> {
    // Return Promise<Subject>
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Set HTTP 204 No Content for successful deletion
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // Return Promise<void> for 204
    await this.subjectsService.remove(id);
    // No need to return the deleted object if using 204 No Content
  }
}
