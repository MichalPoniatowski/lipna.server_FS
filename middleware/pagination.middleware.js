// LEGACY CODE

const pagination = (model) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    const total = await model.countDocuments();

    results.stats = {
      total_results: total,
      total_pages: Math.ceil(total / limit),
      current_page: page,
      results_per_page: limit,
    };

    if (endIndex < total) {
      results.next = {
        page: page + 1,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
      };
    }

    try {
      results.results = await model.find().limit(limit).skip(startIndex);
      res.pagination = results;
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

module.exports = { pagination };
