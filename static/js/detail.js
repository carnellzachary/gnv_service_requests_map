// Bootstrap Modals
var about_modal = new bootstrap.Modal(document.getElementById("about-modal"), {});
var request_modal = new bootstrap.Modal(document.getElementById("request-modal"), {});

// Tooltip for copy link button
var tooltipTriggerList = [].slice.call(document.querySelectorAll('#copy-link-btn[data-bs-toggle="tooltip"]'));
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl, {
      trigger: 'click'
    })
  });

// Share button at bottom request modal
function copyComplaintLink() {
  var copyLink = document.getElementById("copy-link-input");
  copyLink.select();
  copyLink.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(copyLink.value);
}

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

// Attribution: KooiInc on stackoverflow (https://stackoverflow.com/questions/1199352/smart-way-to-truncate-long-strings)
function truncate_string(str, n) {
  return (str.length > n) ? str.slice(0, n - 1) + '&hellip;' : str;
};

function format_datetime(attribute) {
  return dateFormat(attribute, "dddd, mmmm dS, yyyy") + "<br>" + dateFormat(attribute, "h:MM TT")
}

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
