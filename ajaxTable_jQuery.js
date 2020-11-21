function AjaxTable(options = {}) {
  // make obj variable
  var obj = this;
  //
  // defaults
  obj.method = "POST";
  obj.data = {
    offset: 0,
  };
  obj.limits = [10, 25, 50, 100, 250];
  obj.orderBy = [];
  obj.rowsNoLimit = 0;
  obj.log = false;
  obj.tableBefore = '';
  obj.tableAfter  = '';
  obj.execute = function () {}
  //
  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      var val = options[key];
      obj[key] = val;
    }
  }
  if (obj.data.limit == undefined) {
    obj.data.limit = obj.limits[0];
  }
  $(obj.target).each(function () {
    var table = $(this);
    obj.execute = function () {
      obj.data.limit = parseInt(obj.data.limit);
      table.addClass("ajaxTableLoading");
      $.ajax({
        url: obj.url,
        method: obj.method,
        data: obj.data,
        success: function (resault) {
          if (obj.log) console.log(resault);
          table.removeClass("ajaxTableLoading");
          var resaultJSON = JSON.parse(resault);
          obj.rowsNoLimit = resaultJSON.rowsNoLimit;
          // thead
          var tableHead = "";
          for (var key in resaultJSON.rows[0]) {
            if (resaultJSON.rows[0].hasOwnProperty(key)) {
              var found = false;
              for (var i = 0; i < obj.orderBy.length; i++) {
                var el = obj.orderBy[i];
                if (el.order_by == key) {
                  found = true;
                  if (el.order == "desc") {
                    tableHead += `<th class="order-desc"><span>${key}</span></th>`;
                  }else if (el.order == "asc") {
                    tableHead += `<th class="order-asc"><span>${key}</span></th>`;
                  }else {
                    tableHead += `<th><span>${key}</span></th>`;
                  }
                }
              }
              if (!found) {
                tableHead += `<th><span>${key}</span></th>`;
              }
              // if (obj.data.order_by == key) {
              //   if (obj.data.order == "desc") {
              //     tableHead += `<th class="order-desc"><span>${key}</span></th>`;
              //   }else if (obj.data.order == "asc") {
              //     tableHead += `<th class="order-asc"><span>${key}</span></th>`;
              //   }else {
              //     tableHead += `<th><span>${key}</span></th>`;
              //   }
              // }else {
              //   tableHead += `<th><span>${key}</span></th>`;
              // }
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
                var val = row[key];
                tableBody += `<td>${val}</td>`;
              }
            }
            tableBody += `</tr>`;
          }
          tableBody = `<tbody>${tableBody}</tbody>`;
          //
          var tableHTML = `${obj.tableBefore}<table>${tableHead}${tableBody}</table>${obj.tableAfter}`;
          var header = `<div class="ajaxTable-header">
          ${obj.getForm() + obj.getPagination()}
          </div>`;
          var footer = `<div class="ajaxTable-footer">
          <div class="ajaxTable-formContainer">
            <span class="label label-info well-sm">Total: <span class="badge">${obj.rowsNoLimit}</span></span>
          </div>
          ${obj.getPagination()}
          </div>`;
          table.html(header + tableHTML + footer);
          table[0].querySelector("form").onsubmit = function (e) {
            e.preventDefault();
            var formdata = $(this).serializeArray();
            for (let i = 0; i < formdata.length; i++) {
              var data = formdata[i];
              obj.data[data.name] = data.value;
            }
            obj.execute();
          };
          table.find("th").on("click", function (e) {
            // manibulate orderclass
            if (!e.ctrlKey) {
              if ($(this).hasClass("order-desc")) {
                $(this).removeClass("order-desc");
                $(this).addClass("order-asc");
                obj.setData("order", "asc");
                obj.orderBy = [
                  {"order_by": $(this).text(), "order": "asc"},
                ];
              }else {
                $(this).removeClass("order-asc");
                $(this).addClass("order-desc");
                obj.setData("order", "desc");
                obj.orderBy = [
                  {"order_by": $(this).text(), "order": "desc"},
                ];
              }
            }else {
              var found = false;
              for (let i = 0; i < obj.orderBy.length; i++) {
                var row = obj.orderBy[i];
                if (row.order_by == $(this).text()) {
                  found = true;
                  row.order =  (row.order == "desc") ? "asc" : "desc";
                  break;
                }
              }
              if (!found) {
                obj.orderBy.push({"order_by": $(this).text(), "order": "desc"});
              }
            }
            console.log(obj.orderBy);
            //
            // change data order by
            obj.setData("order_by", obj.orderBy);
            obj.setData("offset", 0);
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
    var form = `<div class="ajaxTable-formContainer"><form>
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
    </form></div>
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
