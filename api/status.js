function active() {
  const expiry = Date.parse(process.env.SERVICE_EXPIRES_AT || '');
  return Number.isNaN(expiry) || Date.now() < expiry;
}

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ active: active() });
};

module.exports.active = active;
