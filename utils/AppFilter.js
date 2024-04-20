class ApiFilter {
  constructor(query, queryResult) {
    this.query = query;
    this.queryResult = queryResult;
    this.excludedQuery = ['sort', 'select', 'limit', 'page'];
  }

  filter() {
    // FILTER
    let queryForFilter = { ...this.query };
    this.excludedQuery.forEach(key => delete queryForFilter[key]);

    const queryStr = JSON.stringify(queryForFilter).replace(
      /\b(lt|gt|lte|gte)\b/g,
      match => `$${match}`
    );
    queryForFilter = JSON.parse(queryStr);

    this.queryResult.find(queryForFilter);

    return this;
  }

  sort() {
    if (this.query.sort)
      this.queryResult.sort(this.query.sort.split(',').join(' '));

    return this;
  }

  select() {
    if (this.query.select) {
      this.queryResult.select(this.query.select.split(',').join(' '));
    } else this.queryResult.select('-__v');

    return this;
  }

  pageLimit() {
    let page = this.query.page || 1;
    let limit =
      this.query.limit && this.query.limit > 0 ? this.query.limit : 100;

    this.queryResult.skip((page - 1) * limit).limit(limit);

    return this;
  }
}

module.exports = ApiFilter;
