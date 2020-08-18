function AjaxTable(options = {}) {
  // make obj variable
  var obj = this;
  //
  // default settings
  obj.method = "POST";
  obj.data = {
    limit: 10,
    offset: 0,
  };
  obj.limits = [10, 25, 50, 100, 250];
  obj.rowsNoLimit = 0;
  obj.excludeCols = [];
  //
  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      var val = options[key];
      obj[key] = val;
    }
  }
  $(obj.target).each(function () {
    var table = $(this);
    obj.execute = function () {
      obj.data.limit = parseInt(obj.data.limit);
      $.ajax({
        url: obj.url,
        method: obj.method,
        data: obj.data,
        success: function (resault) {
          var resaultJSON = JSON.parse(resault);
          obj.rowsNoLimit = resaultJSON.rowsNoLimit;
          // thead
          var tableHead = "";
          for (var key in resaultJSON.rows[0]) {
            if (resaultJSON.rows[0].hasOwnProperty(key)) {
              if (obj.excludeCols.includes(key)) {continue;}
              if (obj.data.order_by == key) {
                if (obj.data.order == "desc") {
                  tableHead += `<th class="order-desc">${key}</th>`;
                }else {
                  tableHead += `<th>${key}</th>`;
                }
              }else {
                tableHead += `<th>${key}</th>`;
              }
            }
          }
          tableHead = `<thead><tr>${tableHead}</tr></thead>`;
          //
          // tbody
          var tableBody = "";
          for (let i = 0; i < resaultJSON.rows.length; i++) {
            tableBody += `<tr>`;
            var row = resaultJSON.rows[i];
            for (const key in row) {
              if (row.hasOwnProperty(key)) {
                if (obj.excludeCols.includes(key)) {continue;}
                var val = row[key];
                tableBody += `<td>${val}</td>`;
              }
            }
            tableBody += `</tr>`;
          }
          tableBody = `<tbody>${tableBody}</tbody>`;
          //
          var tableHTML = `<table>${tableHead}${tableBody}</table>`;
          table.html(obj.getForm() + obj.getPagination() + tableHTML + obj.getPagination());
          table[0].querySelector("form").onsubmit = function (e) {
            e.preventDefault();
            var formdata = $(this).serializeArray();
            for (let i = 0; i < formdata.length; i++) {
              var data = formdata[i];
              obj.data[data.name] = data.value;
            }
            obj.execute();
          };
          table.find("th").on("click", function () {
            // manibulate orderclass
            if ($(this).hasClass("order-desc")) {
              $(this).removeClass("order-desc");
              obj.setData("order", "asc");
            }else {
              $(this).addClass("order-desc");
              obj.setData("order", "desc");
            }
            //
            // change data order by
            obj.setData("order_by", $(this).text());
            //
            obj.execute();
          });
          table.find(".ajaxTablePagination span").on("click", function () {
            // change data order by
            var offset = parseInt($(this).data("offset"));
            obj.setData("offset", (offset - 1) * obj.data.limit);
            //
            obj.execute();
          });
        }
      });
    }
  });
  obj.getForm = function () {
    var form = `<form style="margin-bottom: 10px">
      <input name="keyword" id="searchSeriesTable" placeholder='Search...'>
    `;
    var formLimit = "";
    for (let i = 0; i < obj.limits.length; i++) {
      var limit = obj.limits[i];
      if (limit == obj.data.limit) {
        formLimit += `<option selected>${limit}</option>`;
      } else {
        formLimit += `<option>${limit}</option>`;
      }
    }
    form += `Limit:
      <select name="limit">${formLimit}</select>
      <button type="submit" class="btn btn-sm btn-primary">
        <i class="fa fa-paper-plane"></i> Submit
      </button>
    </form>
    `;
    return form;
  }
  obj.setData = function (key, value) {
    if (obj.data == undefined) {
      obj.data = {};
    }
    obj.data[key] = value;
  }
  obj.getPagination = function () {
    if (obj.rowsNoLimit<=obj.data.limit) return '';
    var pagination = "";
    var currentPager = (obj.data.offset / obj.data.limit) + 1;
    currentPager = Math.ceil(currentPager);
    var maxPager = (obj.rowsNoLimit / obj.data.limit);
    maxPager = Math.ceil(maxPager);
    for (let i = currentPager-1; i > currentPager-3 && i > 0; i--) {
      pagination = `<span data-offset="${i}">${i}</span>`+pagination;
    }
    pagination += `<span data-offset="${currentPager}" class="active">${currentPager}</span>`;
    for (let i = currentPager+1; i < currentPager+3 && i<=maxPager; i++) {
      pagination += `<span data-offset="${i}">${i}</span>`;
    }
    if (currentPager > 1) {
      pagination = `<span data-offset="${1}">First</span> ... ` + pagination;
    }
    if (currentPager < maxPager) {
      pagination = pagination + ` ... <span data-offset="${maxPager}">Last</span>`;
    }
    return `<div class="ajaxTablePagination">${pagination}</div>`;
  }
}

// $(document).ready( function () {
//   var ajaxTable = new AjaxTable({
//     url: "action/series",
//     target: ".ajaxTable",
//     excludeCols: ["animeLink", "folderDepthHtml", "subDepthHTML", "updated", "last_update", "custom_url"],
//   });
//   ajaxTable.execute();
// });