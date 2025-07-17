import React, { useState, useEffect } from 'react';
import './App.css';

// Placeholder for authentication - (replace with real logic/integration)
function AuthSection({ user, onAuth }) {
  return (
    <div className="auth-bar">
      {user
        ? <>Hello, <b>{user.name}</b> <button className="auth-btn" onClick={() => onAuth(null)}>Logout</button></>
        : <button className="auth-btn" onClick={() => onAuth({ name: "demo-user" })}>Login</button>
      }
    </div>
  );
}

// Sidebar for folders
function FolderSidebar({ folders, currentFolderId, onSelect, onAddFolder }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>Folders</span>
        <button className="accent-btn sidebar-action" aria-label="Add folder" onClick={onAddFolder}>+</button>
      </div>
      <ul className="folder-list">
        {folders.map(folder =>
          <li
            key={folder.id}
            className={folder.id === currentFolderId ? 'folder-item active' : 'folder-item'}
            onClick={() => onSelect(folder.id)}
          >
            <span role="img" aria-label="folder">📁</span> {folder.name}
          </li>
        )}
      </ul>
    </aside>
  );
}

// Notes list and search
function NotesList({ notes, searchTerm, onNoteSelect, selectedId, onSearch }) {
  const filtered = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="notes-list">
      <div className="notes-list-header">
        <input
          className="search-input"
          placeholder="Search notes…"
          value={searchTerm}
          onChange={e => onSearch(e.target.value)}
        />
      </div>
      <ul className="note-items">
        {filtered.length === 0 &&
          <div className="empty-hint">No notes found</div>
        }
        {filtered.map(note =>
          <li
            key={note.id}
            className={note.id === selectedId ? 'note-item active' : 'note-item'}
            onClick={() => onNoteSelect(note.id)}
          >
            <b>{note.title || "Untitled"}</b>
            <span className="note-snippet">{note.content.slice(0, 40)}{note.content.length > 40 && "…"}</span>
          </li>
        )}
      </ul>
    </div>
  );
}

// Editor for single note
function NoteEditor({ note, onUpdate, onDelete, onTitleChange, onContentChange }) {
  if (!note) {
    return <div className="note-editor note-editor-empty">Select a note or create a new note.</div>;
  }
  return (
    <div className="note-editor">
      <input
        className="note-title-input"
        value={note.title}
        onChange={e => onTitleChange(e.target.value)}
        placeholder="Title"
      />
      <textarea
        className="note-content-input"
        value={note.content}
        onChange={e => onContentChange(e.target.value)}
        placeholder="Write your note here…"
        rows={8}
      />
      <div className="note-actions">
        <button className="accent-btn" onClick={onUpdate}>Save</button>
        <button className="danger-btn" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}

// Floating button for new note
function FloatingAddButton({ onClick }) {
  return (
    <button className="fab" aria-label="Add new note" onClick={onClick}>
      +
    </button>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [theme] = useState('light');
  const [user, setUser] = useState(null);

  // Demo state: folders, notes
  const [folders, setFolders] = useState([
    { id: 'f1', name: 'All Notes' },
    { id: 'f2', name: 'Work' },
    { id: 'f3', name: 'Personal' }
  ]);
  const [folderId, setFolderId] = useState('f1');
  const [notes, setNotes] = useState([
    { id: 'n1', folderId: 'f1', title: 'Welcome', content: 'This is a sample note.' },
    { id: 'n2', folderId: 'f2', title: 'Work Plan', content: 'Organize project milestones.' },
    { id: 'n3', folderId: 'f3', title: 'Groceries', content: 'Milk, eggs, bread…' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [editingNote, setEditingNote] = useState(null);

  // Authentication handling (placeholder)
  function handleAuth(userObj) {
    setUser(userObj);
    setSelectedNoteId(null);
    setEditingNote(null);
  }

  // Folder CRUD
  function handleAddFolder() {
    const name = prompt("Folder name?");
    if (name) {
      const id = 'f' + (+new Date());
      setFolders(f => [...f, { id, name }]);
    }
  }

  // Notes CRUD
  function handleAddNote() {
    const id = 'n' + (+new Date());
    const folder = folderId || folders[0].id;
    const newNote = { id, folderId: folder, title: '', content: '' };
    setNotes(n => [...n, newNote]);
    setSelectedNoteId(id);
    setEditingNote(newNote);
  }

  function handleSelectFolder(id) {
    setFolderId(id);
    setSearchTerm('');
  }

  function handleNoteSelect(id) {
    setSelectedNoteId(id);
    const note = notes.find(n => n.id === id);
    setEditingNote({ ...note });
  }

  function handleNoteUpdate() {
    if (!editingNote) return;
    setNotes(notes =>
      notes.map(n => n.id === editingNote.id ? editingNote : n)
    );
    setEditingNote(null);
  }

  function handleNoteDelete() {
    if (!editingNote) return;
    setNotes(notes => notes.filter(n => n.id !== editingNote.id));
    setSelectedNoteId(null);
    setEditingNote(null);
  }

  function handleTitleChange(title) {
    setEditingNote(e => ({ ...e, title }));
  }
  function handleContentChange(content) {
    setEditingNote(e => ({ ...e, content }));
  }

  // Filter notes per current folder
  const visibleNotes = notes.filter(n => folderId === 'f1' || n.folderId === folderId);

  return (
    <div className="app-root">
      <header className="global-header">
        <span className="app-title">📝 Simple Notes</span>
        <AuthSection user={user} onAuth={handleAuth} />
      </header>
      <div className="container-main">
        <FolderSidebar
          folders={folders}
          currentFolderId={folderId}
          onSelect={handleSelectFolder}
          onAddFolder={handleAddFolder}
        />
        <main className="main-content">
          <NotesList
            notes={visibleNotes}
            searchTerm={searchTerm}
            onNoteSelect={handleNoteSelect}
            selectedId={selectedNoteId}
            onSearch={setSearchTerm}
          />
          <NoteEditor
            note={editingNote}
            onUpdate={handleNoteUpdate}
            onDelete={handleNoteDelete}
            onTitleChange={handleTitleChange}
            onContentChange={handleContentChange}
          />
        </main>
        <FloatingAddButton onClick={handleAddNote} />
      </div>
    </div>
  );
}

export default App;
