import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

// GET /notes ?page & perPage & tag & search
export async function getAllNotes(req, res, next) {
  try {
    const { page = 1, perPage = 10, tag, search } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const perPageNum = Math.min(20, Math.max(5, Number(perPage) || 10));

    const filter = {};
    if (tag) filter.tag = tag;
    if (typeof search === 'string') {
      const s = search.trim();
      if (s !== '') filter.$text = { $search: s };
    }

    const skip = (pageNum - 1) * perPageNum;

    const [totalNotes, notes] = await Promise.all([
      Note.countDocuments(filter),
      Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(perPageNum).lean(),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalNotes / perPageNum));

    res.status(200).json({
      page: pageNum,
      perPage: perPageNum,
      totalNotes,
      totalPages,
      notes,
    });
  } catch (err) {
    next(err);
  }
}

// GET /notes/:noteId
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

// POST /notes
export async function createNote(req, res, next) {
  try {
    const { title, content = '', tag = 'Todo' } = req.body;
    const created = await Note.create({ title, content, tag });
    res.status(201).json(created.toJSON());
  } catch (err) {
    next(err);
  }
}

// PATCH /notes/:noteId
export async function updateNote(req, res, next) {
  try {
    const { noteId } = req.params;
    const { title, content, tag } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (tag !== undefined) updates.tag = tag;

    const updated = await Note.findByIdAndUpdate(
      noteId,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return next(createHttpError(404, 'Note not found'));
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE /notes/:noteId
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
