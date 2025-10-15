import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

export async function getAllNotes(req, res, next) {
  try {
    const { page = 1, perPage = 10, tag, search } = req.query;
    const pageNum = Number(page) || 1;
    const perPageNum = Number(perPage) || 10;

    const query = { userId: req.user._id };
    if (tag) query.tag = tag;
    if (search) query.$text = { $search: search };

    const [notes, totalNotes] = await Promise.all([
      Note.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * perPageNum)
        .limit(perPageNum)
        .lean(),
      Note.countDocuments(query),
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

export async function getNoteById(req, res, next) {
  try {
    const { noteId } = req.params;
    const note = await Note.findOne({ _id: noteId, userId: req.user._id }).lean();
    if (!note) return next(createHttpError(404, 'Note not found'));
    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
}

export async function createNote(req, res, next) {
  try {
    const { title, content, tag } = req.body;
    const created = await Note.create({ title, content, tag, userId: req.user._id });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function updateNote(req, res, next) {
  try {
    const { noteId } = req.params;
    const { title, content, tag } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (tag !== undefined) updates.tag = tag;

    const updated = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.user._id },
      { $set: updates },
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
    const deleted = await Note.findOneAndDelete({ _id: noteId, userId: req.user._id }).lean();
    if (!deleted) return next(createHttpError(404, 'Note not found'));
    res.status(200).json(deleted);
  } catch (err) {
    next(err);
  }
}
