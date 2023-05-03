var about_modal = new bootstrap.Modal(document.getElementById("about-modal"), {});
var request_modal = new bootstrap.Modal(document.getElementById("request-modal"), {});

var map = L.map("map", {
  zoomControl: false
}).setView([29.64425, -82.34300], 12);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

var tiles = L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>',
  preferCanvas: true,
}).addTo(map);

var bounds = L.latLngBounds();

var markerClusters = L.markerClusterGroup({
  maxClusterRadius: 45
}).addTo(map);

// Attribution: KooiInc on stackoverflow (https://stackoverflow.com/questions/1199352/smart-way-to-truncate-long-strings)
function truncate_string(str, n) {
  return (str.length > n) ? str.slice(0, n - 1) + '&hellip;' : str;
};

function format_datetime(attribute) {
  return dateFormat(attribute, "dddd, mmmm dS, yyyy") + "<br>" + dateFormat(attribute, "h:MM TT")
}

function open_request_modal() {
  // Need to detect which feature and populate modal accordingly
  // Maybe can pass layer as parameter / can define layer in pointToLayer
  request_modal.show();
}

fetch("static/data/markers.geojson")
  .then((response) => response.json())
  .then((geojsonData) => {

    var geojsonLayer = L.geoJson(geojsonData, {
      pointToLayer: function(feature, latlng) {
        bounds.extend(latlng);

        var f = feature.properties;
        var r_modal_element = document.querySelector('#request-modal');

        var desc_truncated = (f.description && f.description !== 'None') ? truncate_string(f.description, 285) : "<em>No description reported.</em>";

        // Attribution for detecting if user on mobile: Timothy Huang (https://dev.to/timhuang/a-simple-way-to-detect-if-browser-is-on-a-mobile-device-with-javascript-44j3)
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          var tooltip_click_msg = "";
        } else {
          var tooltip_click_msg = "<hr style='margin: 5px 0;'><em>Click marker for more details...</em>";
        }

        var tooltip_content = "<strong>Type:</strong> " + f.request_type + "<br><strong>Date:</strong> " + dateFormat(f.request_date, "fullDate") + "<br><hr style='margin: 5px 0;'>" + desc_truncated + tooltip_click_msg;

        var m = L.marker(latlng)
          .bindPopup(tooltip_content)
          .on({
            click: function(e) {
              var if_address = (f.address) ? f.address : "";
              var if_reporter_display = (f.reporter_display) ? f.reporter_display : "";
              var if_closed = (f.closed) ? format_datetime(f.closed) : "";
              var if_status = (f.status) ? f.status : "";
              var if_assigned_to = (f.assigned_to) ? f.assigned_to : "";
              var if_desc = (f.description) ? f.description : "<em>No description reported.</em>";
              // var sharable_link = '{{ url_for('detail') }}' + f.ID;

              // Days-Minutes to Close
              if (f.minutes_to_close && f.days_to_close) {
                var days = (f.days_to_close == 1) ? f.days_to_close + " Day" : f.days_to_close + " Days";
                var minutes = (f.minutes_to_close == 1) ? f.minutes_to_close + " Minute" : f.minutes_to_close + " Minutes";
              } else {
                var days = '';
                var months = '';
              }

              var if_time_closed = (f.minutes_to_close && f.days_to_close) ? "<tr><th>Days / Minutes to Close</th><td>" + days + " / " + minutes + "</td></tr>" : "";

              // Date Acknowledged
              var if_ack = (f.acknowledged) ? format_datetime(f.acknowledged) : "";

              var table_content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>ID</th><td>" + f.id + "</td></tr>" + "<tr><th>Request Type</th><td>" + f.request_type + "</td></tr>" + "<tr><th>Reporter Display Name</th><td>" + if_reporter_display + "</td></tr>" + "<tr><th>Address</th><td>" + if_address + "</td></tr>" + "<tr><th>Latitude</th><td>" + feature.geometry.coordinates[1].toString() + "</td></tr>" + "<tr><th>Longitude</th><td>" + feature.geometry.coordinates[0].toString() + "</td></tr>" + "<tr><th>Date Reported</th><td>" + dateFormat(f.request_date, "fullDate") + "</td></tr>" + "<tr><th>Date Acknowledged</th><td>" + if_ack + "</td></tr>" + "<tr><th>Assigned To</th><td>" + if_assigned_to + "</td></tr>" + "<tr><th>Last Updated</th><td>" + format_datetime(f.last_updated) + "</td></tr>" + "<tr><th>Status</th><td>" + if_status + "</td></tr>" + "<tr><th>Date Closed</th><td>" + if_closed + "</td></tr>" + if_time_closed + "</table>";

              $('#request-modal').find('.modal-table').html(table_content); // I use jQuery here to just quickly format table_content string to html. I already have to load jQuery to load parts of Bootstrap anyway

              r_modal_element.querySelector(".modal-title").innerHTML = "Gainesville Service Request - " + f.request_type;
              r_modal_element.querySelector(".modal-p").innerHTML = if_desc;

              request_modal.show();
            },
            mouseover: function(e) {
              this.openPopup();
            },
            mouseout: function(e) {
              this.closePopup();
            },
          });

        return markerClusters.addLayer(m);
      }
    }).addTo(map);

    if (bounds.length > 0) {
      map.fitBounds(bounds, {
        padding: [65, 65]
      });
    }

  });

// Attribution: David Thomas on stackoverflow (https://stackoverflow.com/questions/19480385/css-hover-can-it-effect-multiple-divs-with-same-class-name)
function classToggle(evt, parent, child, toggle) {
  [].forEach.call(document.querySelector(parent).querySelectorAll(child), function(a) {
    a.classList[evt.type === 'mouseover' ? 'add' : 'remove'](toggle);
  });
}

function toggle_keyword_and_or() {
  var keyword_list = document.querySelector('#keyword_list');
  var keyword_and_or_input = document.querySelector('#keyword_and_or_input');
  var keyword_and_ors = keyword_list.getElementsByClassName("keyword_and_or");

  if (keyword_and_or_input.value == "or") {
    for (var i = 0; i < keyword_and_ors.length; i++) {
      keyword_and_ors[i].innerHTML = 'and';
    }
    keyword_and_or_input.value = 'and';
  } else {
    for (var i = 0; i < keyword_and_ors.length; i++) {
      keyword_and_ors[i].innerHTML = 'or';
    }
    keyword_and_or_input.value = 'or';
  }
}

function inputs_select_all(el, tag) {
  var checkboxes = document.getElementsByName(tag);
  for (var i = 0, n = checkboxes.length; i < n; i++) {
    checkboxes[i].checked = el.checked;
  }
}

function toggle_sidebar() {
  document.querySelector('#about-toggle-btn').classList.toggle('sidebar-button-left-pos');
  document.querySelector('#sidebar-toggle-btn').classList.toggle('sidebar-button-left-pos');
  document.querySelector('#sidebar-container').classList.toggle('sidebar-left-pos');
}

// Bootstrap modals require jQuery
document.addEventListener("DOMContentLoaded", function() {
  // For banner close
  document.querySelector('#banner-close').addEventListener('click', function(e) {
    document.querySelector('#welcome-banner').remove();
  });

  // For sidebar toggle
  document.querySelector('#sidebar-toggle-btn').addEventListener('click', function(e) {
    document.querySelector('#about-toggle-btn').classList.toggle('sidebar-button-left-pos');
    document.querySelector('#sidebar-toggle-btn').classList.toggle('sidebar-button-left-pos');
    document.querySelector('#sidebar-container').classList.toggle('sidebar-left-pos');
  });

  // Attribution for detecting if user on mobile: Timothy Huang (https://dev.to/timhuang/a-simple-way-to-detect-if-browser-is-on-a-mobile-device-with-javascript-44j3)
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    console.log('On mobile.');
  } else {
    setTimeout(toggle_sidebar, 1900);
  }

  // For about modal toggle
  document.querySelector('#about-toggle-btn').addEventListener('click', function(e) {
    about_modal.show();
  });

  // For sidebar dropdown functionality: https://bootstrap-menu.com/detail-sidebar-nav-collapse.html
  document.querySelectorAll('.sidebar .nav-link').forEach(function(element) {

    element.addEventListener('click', function(e) {

      let nextEl = element.nextElementSibling;
      let parentEl = element.parentElement;
      let iconEl = element.querySelector('.filter-header-arrow');

      if (nextEl) {
        e.preventDefault();
        let mycollapse = new bootstrap.Collapse(nextEl);

        if (iconEl.classList.contains('fa-caret-down')) {
          iconEl.classList.replace('fa-caret-down', 'fa-caret-left');
          mycollapse.hide();
        } else {
          iconEl.classList.replace('fa-caret-left', 'fa-caret-down');
          mycollapse.show();
        }
      }
    });
  });

  // To add a keyword
  document.querySelector('#keyword_add').addEventListener('click', function(e) {
    var keyword_list = document.querySelector('#keyword_list');
    var keyword_item_container = document.createElement('li');
    var keyword_delete = document.createElement('div');
    var keyword_specified = document.createElement('div');
    var keyword_input = document.createElement('input');

    var keyword_toadd = document.querySelector('#keyword_toadd').value;

    if (keyword_toadd.length > 0) {

      keyword_delete.setAttribute('class', 'keyword_delete btn-danger');
      keyword_delete.innerHTML = '-';
      keyword_delete.addEventListener('click', function(evt) {
        if (keyword_item_container.nextElementSibling && keyword_item_container.nextElementSibling.getAttribute('class') == 'keyword_and_or_container') {
          keyword_item_container.nextElementSibling.remove();
        }
        keyword_item_container.remove();
      });

      keyword_specified.setAttribute('class', 'keyword_specified');
      keyword_specified.innerHTML = keyword_toadd;

      keyword_input.setAttribute('type', 'hidden');
      keyword_input.setAttribute('name', 'keyword');
      keyword_input.setAttribute('value', keyword_toadd);

      keyword_item_container.setAttribute('class', 'keyword_item_container keyword_added');
      keyword_item_container.setAttribute('title', keyword_toadd);
      keyword_item_container.appendChild(keyword_delete);
      keyword_item_container.appendChild(keyword_specified);
      keyword_item_container.appendChild(keyword_input);

      // If keyword_list has at least one keyword right before another is added, add and/or selector first
      if (keyword_list.getElementsByClassName("keyword_added").length >= 1) {
        var keyword_and_or_container = document.createElement('li');
        var keyword_and_or = document.createElement('span');

        keyword_and_or_container.setAttribute('class', 'keyword_and_or_container');

        keyword_and_or.setAttribute('class', 'keyword_and_or');
        keyword_and_or.innerHTML = document.querySelector('#keyword_and_or_input').value;
        keyword_and_or.addEventListener('mouseover', function(evt) {
          classToggle(evt, '#sidebar-list', '.keyword_and_or', 'keyword_and_or_hover');
        });
        keyword_and_or.addEventListener('mouseout', function(evt) {
          classToggle(evt, '#sidebar-list', '.keyword_and_or', 'keyword_and_or_hover');
        });
        keyword_and_or.addEventListener('click', function(evt) {
          toggle_keyword_and_or();
        });

        keyword_and_or_container.appendChild(keyword_and_or);

        keyword_list.appendChild(keyword_and_or_container);
      }

      keyword_list.appendChild(keyword_item_container);
    }
  });
});
