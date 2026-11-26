import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { ErrorMessage, Loading } from '../components/Toast';

export default function HomePage() {
  const { user } = useAuth();
  const staff = ['admin', 'librarian'].includes(user.role);
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [availableCopies, setAvailableCopies] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([api.get('/issues?status=active'), api.get('/books?limit=4'), api.get('/books/stats')])
      .then(([loanData, bookData, bookStats]) => { setIssues(loanData.issues); setBooks(bookData.books); setAvailableCopies(bookStats.availableCopies); })
      .catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);
  const overdue = issues.filter((issue) => new Date(issue.dueDate) < new Date()).length;
  const greeting = user.name.split(' ')[0];
  return <>
    <section className="welcome-banner"><div className="welcome-copy"><span className="eyebrow eyebrow-light">{new Intl.DateTimeFormat('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()).toUpperCase()}</span><h1>Good to see you, {greeting}<span className="wave">✳</span></h1><p>Your next great read is waiting. Here’s what’s happening at your library.</p><Link to="/books" className="button button-light">Explore the collection <span>→</span></Link></div><div className="book-stack" aria-hidden="true"><div className="stack-book stack-book-one"><span>THE ART<br />OF LESS</span><small>J. K. ROWE</small></div><div className="stack-book stack-book-two"><span>DESIGNING<br />YOUR DAYS</span><small>FIELD NOTES</small></div><div className="stack-book stack-book-three"><span>THE<br />WILDERNESS<br />WITHIN</span><small>ESSAYS · 2024</small></div><div className="stack-sun"></div></div></section>
    <ErrorMessage>{error}</ErrorMessage>
    {loading ? <Loading /> : <>
      <section className="stats-grid"><Stat label={staff ? 'Active loans' : 'Books checked out'} value={issues.length} icon="↗" tint="mint" detail={staff ? 'Across all students' : 'Currently in your care'} /><Stat label="Overdue" value={overdue} icon="◷" tint="peach" detail={overdue ? 'Please return soon' : 'You’re all caught up'} /><Stat label="Available to borrow" value={availableCopies} icon="▤" tint="lavender" detail="Across the full collection" /><Stat label="Your role" value={user.role === 'student' ? 'Student' : user.role[0].toUpperCase() + user.role.slice(1)} icon="✳" tint="cream" detail="CampusLibrary member" /> </section>
      <section className="home-columns"><div className="panel loan-panel"><div className="section-heading"><div><span className="eyebrow">YOUR READING LIST</span><h2>{staff ? 'Recent active loans' : 'Your active loans'}</h2></div><Link to="/loans" className="text-link">View all <span>→</span></Link></div>{issues.length ? <div className="loan-list">{issues.slice(0, 4).map((issue) => <div className="loan-item" key={issue._id}><BookCover book={issue.book} /><div className="loan-book-info"><strong>{issue.book?.title}</strong><small>{issue.book?.author}</small></div><div className="loan-due"><small>DUE DATE</small><strong className={new Date(issue.dueDate) < new Date() ? 'text-danger' : ''}>{formatDate(issue.dueDate)}</strong></div></div>)}</div> : <div className="empty-state">No active loans yet. Browse the collection to find a book.</div>}</div>
        <div className="panel picks-panel"><div className="section-heading"><div><span className="eyebrow">FROM THE SHELVES</span><h2>Recently added</h2></div><Link to="/books" className="text-link">Browse <span>→</span></Link></div><div className="recent-grid">{books.slice(0, 4).map((book, i) => <Link to="/books" className="recent-book" key={book._id}><BookCover book={book} variant={`cover-${i % 4}`} /><strong>{book.title}</strong><small>{book.author}</small></Link>)}</div>{!books.length && <div className="empty-state">No books in the catalogue yet.</div>}</div>
      </section>
      {staff && <section className="quick-actions"><div><span className="eyebrow">LIBRARY TOOLS</span><h2>Keep things moving</h2></div><Link to="/loans" className="quick-action"><span className="quick-icon">↗</span><span><strong>Issue or return a book</strong><small>Open the loan desk</small></span><b>→</b></Link><Link to="/books" className="quick-action"><span className="quick-icon quick-icon-alt">＋</span><span><strong>Manage catalogue</strong><small>Add or update a title</small></span><b>→</b></Link></section>}
    </>}
  </>;
}
export function BookCover({ book, variant = '' }) {
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [book?.coverUrl]);
  return book?.coverUrl && !imageFailed
    ? <img className={`book-cover ${variant}`} src={book.coverUrl} alt={`${book.title} cover`} onError={() => setImageFailed(true)} />
    : <div className={`book-cover cover-placeholder ${variant}`}><span>{book?.title?.slice(0, 1) || 'B'}</span><small>{book?.category || 'READ'}</small></div>;
}
export function formatDate(value) { return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)); }
function Stat({ label, value, icon, tint, detail }) { return <article className="stat-card"><div className={`stat-icon ${tint}`}>{icon}</div><div><small>{label}</small><strong>{value}</strong><span>{detail}</span></div></article>; }
