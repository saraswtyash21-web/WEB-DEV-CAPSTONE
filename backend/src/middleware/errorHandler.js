export function notFound(req, res) { res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }); }

export function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === 11000) return res.status(409).json({ message: 'A record with that value already exists.' });
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(' ') });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid record ID.' });
  const status = err.status || 500;
  res.status(status).json({ message: status === 500 ? 'Something went wrong.' : err.message });
}
