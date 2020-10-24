var tasks = {};

// CREATE A NEW TASK ITEM
var createTask = function(taskText, taskDate, taskList) {
  // STEP 1: create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // STEP 2: append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // STEP 3: check due date
  auditTask(taskLi);

  // STEP 4: append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // STEP 1: if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // STEP 2.0: loop over object properties
  $.each(tasks, function(list, arr) {

    // STEP 2.1: then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

$(".list-group").on("click", "p", function() {
  console.log(this);
});

// TASK PARAGRAPH WAS CLICKED
$(".list-group").on("click", "p", function() {
  var text = $(this)
    .text()
    .trim();

  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);

  $(this).replaceWith(textInput);

  textInput.trigger("focus");

  console.log(text);
});

// TASK PARAGRAPH WAS DESELECTED
$(".list-group").on("blur", "textarea", function() {
  // STEP 1: get the textarea's current value/text
  var text = $(this)
    .val()
    .trim();

  // STEP 2: get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // STEP 3: get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

    tasks[status][index].text = text;
    saveTasks();

  // STEP 4: recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // STEP 5: replace textarea with p element
  $(this).replaceWith(taskP);
});

// TASK DUE DATE WAS CLICKED
$(".list-group").on("click", "span", function() {
  // STEP 1: get current text
  var date = $(this).text().trim();

  // STEP 2: create new input element
  var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);

 // STEP 3: swap out elements
  $(this).replaceWith(dateInput);

  // STEP 4.1: enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 0,
    onClose: function() {
      // STEP 4.2: when calendar is closed, force a "change" event on the `dateInput`
      $(this).trigger("change");
    }
  });

  // automatically bring up the calendar
  dateInput.trigger("focus");
});

// VALUE OF TASK DUE DATE WAS EDITED/CHANGED
$(".list-group").on("change", "input[type='text']", function() {
  // STEP 1: get current text
  var date = $(this)
    .val()
    .trim();

  // STEP 2: get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // STEP 3: get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // STEP 4: update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // STEP 5: recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // STEP 6: replace input with span element
  $(this).replaceWith(taskSpan);

  // STEP 7: Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});

// TASK LIST SORTING ORDERING WAS CHANGED
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    // console.log("activate", this);
  },
  deactivate: function(event) {
    // console.log("deactivate", this);
  },
 //
  out: function(event) {
    // console.log("out", event.target);
  },

  update: function(event) {

    var tempArr = [];

    // loop over current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      // add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });

    // trim down list's ID to match object property
    var arrName = $(this)
    .attr("id")
    .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }

});

// TASK ITEM WAS DROPPED IN TRASH
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    console.log("drop");
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});

// AUDIT TASKS WITH CONDITIONAL FORMATTING BASED ON DUE DATE
var auditTask = function(taskEl) {
  // STEP 1: get date from task element
  var date = $(taskEl).find("span").text().trim();

  // STEP 2: convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);

  // STEP 3: remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

   // apply new class if task is near/over due date
   if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
   }
   else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// MODAL DATE INPUT SELECTED
$("#modalDueDate").datepicker({
  minDate: 0
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


