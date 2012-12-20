describe("A HeaderCell", function () {

  it("throws TypeError if a column is not given", function () {
    expect(function () {
      new Backgrid.HeaderCell({
        collection: new Backbone.Collection()
      });
    }).toThrow(new TypeError("'column' is required"));
  });

  it("throws TypeError if a collection is not given", function () {
    expect(function () {
      new Backgrid.HeaderCell({
        column: [{
          name: "name",
          cell: "string"
        }]
      });
    }).toThrow(new TypeError("'collection' is required"));
  });

  var Book = Backbone.Model.extend({});
  var Books = Backbone.Collection.extend({
    model: Book
  });

  var books;
  var cell;
  beforeEach(function () {

    books = new Books([{
      title: "Alice's Adventures in Wonderland"
    }, {
      title: "A Tale of Two Cities"
    }, {
      title: "The Catcher in the Rye"
    }]);

    cell = new Backgrid.HeaderCell({
      column: {
        name: "title",
        cell: "string"
      },
      collection: books
    });

    cell.render();
  });

  it("renders a table header cell with an anchor wrapping the label text and the sort caret", function () {
    expect(cell.el.tagName).toBe("TH");
    expect(cell.$el.find("a").text()).toBe("title");
    expect(cell.$el.find(".sort-caret").length).toBe(1);
  });

  it("sorts the underlying collection in ascending order upon clicking the sort caret once", function () {
    
    cell.$el.find("a").click();

    expect(cell.collection.toJSON()).toEqual([{
      title: "A Tale of Two Cities"
    }, {
      title: "Alice's Adventures in Wonderland"
    }, {
      title: "The Catcher in the Rye"
    }]);
  });

  it("sorts the underlying collection in descending order upon clicking the sort caret twice", function () {

    cell.$el.find("a").click().click();

    expect(cell.direction()).toBe("descending");

    expect(cell.collection.toJSON()).toEqual([{
      title: "The Catcher in the Rye"
    }, {
      title: "Alice's Adventures in Wonderland"
    }, {
      title: "A Tale of Two Cities"
    }]);

  });

  it("sorts the underlying collection in default order upon clicking the sort caret thrice", function () {

    cell.$el.find("a").click().click().click();

    expect(cell.direction()).toBeNull();
    
    expect(cell.collection.toJSON()).toEqual([{
      title: "Alice's Adventures in Wonderland"
    }, {
      title: "A Tale of Two Cities"
    }, {
      title: "The Catcher in the Rye"
    }]);

  });

  it("can sort on a client-side Backbone.PageableCollection", function () {

    var Books = Backbone.PageableCollection.extend({
      model: Book
    });

    var books = new Books([{
      title: "Alice's Adventures in Wonderland"
    }, {
      title: "A Tale of Two Cities"
    }, {
      title: "The Catcher in the Rye"
    }], {
      state: {
        isClientMode: true,
        pageSize: 1
      }
    });

    cell = new Backgrid.HeaderCell({
      column: {
        name: "title",
        cell: "string"
      },
      collection: books
    });

    cell.render();

    cell.$el.find("a").click();

    expect(cell.collection.toJSON()).toEqual([{
      title: "A Tale of Two Cities"
    }]);

    cell.collection.getPage(2);

    expect(cell.collection.toJSON()).toEqual([{
      title: "Alice's Adventures in Wonderland"
    }]);

    cell.collection.getPage(3);

    expect(cell.collection.toJSON()).toEqual([{
      title: "The Catcher in the Rye"
    }]);

    cell.collection.getFirstPage();

    cell.$el.find("a").click();

    expect(cell.collection.toJSON()).toEqual([{
      title: "The Catcher in the Rye"
    }]);

    cell.$el.find("a").click();

    expect(cell.collection.toJSON()).toEqual([{
      title: "Alice's Adventures in Wonderland"
    }]);

  });

});

describe("A HeaderRow", function () {

  var Book = Backbone.Model.extend({});

  var Books = Backbone.Collection.extend({
    model: Book
  });

  var books;
  var row;

  beforeEach(function () {

    books = new Books([{
      title: "Alice's Adventures in Wonderland",
      year: 1865
    }, {
      title: "A Tale of Two Cities",
      year: 1859
    }, {
      title: "The Catcher in the Rye",
      year: 1951
    }]);

    row = new Backgrid.HeaderRow({
      columns: [{
        name: "name",
        cell: "string"
      }, {
        name: "year",
        cell: "integer"
      }],
      collection: books
    });

    row.render();
  });

  it("throws TypeError when a list of column definition is not given", function () {
    expect(function () {
      new Backgrid.HeaderRow({
        collection: new Backbone.Collection()
      });
    }).toThrow(new TypeError("'columns' is required"));
  });

  it("throws TypeError when a collection is not given", function () {
    expect(function () {
      new Backgrid.HeaderRow({
        columns: [{
          name: "name",
          cell: "string"
        }]
      });
    }).toThrow(new TypeError("'collection' is required"));
    
  });

  it("renders a row of header cells", function () {
    expect(row.$el[0].tagName).toBe("TR");
    expect(row.$el[0].innerHTML).toBe('<th><a>name<b class="sort-caret"></b></a></th>' +
                                      '<th><a>year<b class="sort-caret"></b></a></th>');
  });

  it("renders a custom header cell for a single column", function () {
    var CustomHeaderCell = Backgrid.HeaderCell.extend({
      render: function() {
        this.$el.html("Custom header")
        return this;
      }
    })

    row = new Backgrid.HeaderRow({
      columns: [{
        name: "name",
        cell: "string",
      }, {
        name: "year",
        cell: "integer",
        headerCell: CustomHeaderCell
      }],
      collection: books
    });

    row.render();

    expect(row.$el[0].innerHTML).toBe('<th><a>name<b class="sort-caret"></b></a></th>' +
                                      '<th>Custom header</th>');
  });

  it("resets the carets of the non-sorting columns", function () {
    row.$el.find("a").eq(0).click(); // ascending
    row.$el.find("a").eq(1).click(); // ascending, resets the previous
    expect(row.$el.find("a").eq(0).hasClass("ascending")).toBe(false);
    expect(row.$el.find("a").eq(1).hasClass("ascending")).toBe(false);
  });

});

describe("A Header", function () {

  it("throws TypeError if a list of column definitions is not given", function () {
    expect(function () {
      new Backgrid.Header({
        collection: new Backbone.Collection()
      });
    }).toThrow(new TypeError("'columns' is required"));
  });

  it("throws TypeError if a collection is not given", function () {
    expect(function () {
      new Backgrid.Header({
        columns: [{
          name: "title",
          cell: "string"
        }]
      });
    }).toThrow(new TypeError("'collection' is required"));
  });

  var Book = Backbone.Model.extend({});

  var Books = Backbone.Collection.extend({
    model: Book
  });

  var books;
  var head;

  beforeEach(function () {

    books = new Books([{
      title: "Alice's Adventures in Wonderland",
      year: 1865
    }, {
      title: "A Tale of Two Cities",
      year: 1859
    }, {
      title: "The Catcher in the Rye",
      year: 1951
    }]);

    head = new Backgrid.Header({
      columns: [{
        name: "name",
        cell: "string"
      }, {
        name: "year",
        cell: "integer"
      }],
      collection: books
    });

    head.render();
  });

  it("renders a header with a row of header cells", function () {
    expect(head.$el[0].tagName).toBe("THEAD");
    expect(head.$el[0].innerHTML).toBe('<tr><th><a>name<b class="sort-caret"></b></a></th>' +
                                      '<th><a>year<b class="sort-caret"></b></a></th></tr>');
  });

});
