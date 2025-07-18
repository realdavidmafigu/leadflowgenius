module.exports = {
  async rewrites() {
    return [
      {
        source: '/media',
        destination: '/api/media',
      },
    ];
  },
}; 