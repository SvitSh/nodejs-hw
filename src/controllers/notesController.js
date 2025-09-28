import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

export async function getAllNotes(_req, res, next) {
  try {
    const notes = await Note.find().lean();
    res.status(200).json(notes);
  } catch (err) {
    next(err);
  }
}

export async function getNoteById(req, res, next) {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId).lean();
    if (!note) return next(createHttpError(404, 'Note not found'));
    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
}

export async function createNote(req, res, next) {
  try {
    const { title, content = '', tag } = req.body;
    if (!title) return next(createHttpError(400, 'Title is required'));
    const created = await Note.create({ title, content, tag });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function updateNote(req, res, next) {
  try {
    const { noteId } = req.params;
    const { title, content, tag } = req.body;
    const updated = await Note.findByIdAndUpdate(
      noteId,
      { $set: { ...(title !== undefined && { title }), ...(content !== undefined && { content }), ...(tag !== undefined && { tag }) } },
      { new: true, runValidators: true }
    ).lean();
    if (!updated) return next(createHttpError(404, 'Note not found'));
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteNote(req, res, next) {
  try {
    const { noteId } = req.params;
    const deleted = await Note.findByIdAndDelete(noteId).lean();
    if (!deleted) return next(createHttpError(404, 'Note not found'));
    res.status(200).json(deleted);
  } catch (err) {
    next(err);
  }
}
