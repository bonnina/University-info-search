
(function() {
  'use strict';
  let arr = [];
  let refreshCheckboxes = false;

  /* counts checked items */
  function countChecked() {
    let count = document.querySelectorAll('input[type="checkbox"]:checked').length;
    document.getElementById('count').innerHTML = `Saved items: ${count}`;
  }
 
  /* basic input sanitization */
  function sanitize(string) {  
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match)=>(map[match]));
  }

  function fetcher(req) {
    req = sanitize(req);
    let proxy = 'https://cors-anywhere.herokuapp.com/'
    let url = `http://universities.hipolabs.com/search?name=${req}`;
    fetch(proxy + url)
      .then(response => response.json())
      .then(json => {
        let data = Object.entries(json);
        if(data !== undefined)  {
          /* clear previous results */
          let table = document.getElementById("jsonData");
          table.innerHTML = "";

          /* update storage */
          localStorage.setItem('savedInp', req);
          
          /* if user serched for new information, refresh checkboxes */
          if(refreshCheckboxes) {
            arr = [];
            localStorage.setItem('checked', arr);
          }
          makeTable(data);
        }
      })
      .catch(error => console.log(error.message));
  }

  /* Get data from local storage */
  let savedInp = ''; 
  if (localStorage['savedInp'] === undefined || localStorage['savedInp'] === null) {
    /* nothing was saved yet */
    console.log('No data yet');
    // return; 
  }
  else { 
    /* fetch previous search result */
    savedInp = localStorage.getItem('savedInp');
    document.getElementById('inp').value = savedInp;
    fetcher(savedInp);
  }

  /* function to convert nodelists to arrays */
  function slice(domNodes) {
    return Array.prototype.slice.call(domNodes);
  }
  
  /* function constr. to manage checkboxes */
  function Checkbox(el) {
    this.el = el;
    this.el.addEventListener('click', this.save.bind(this));
  };
  Checkbox.prototype.save = function() {
    countChecked()
    let id = this.el.id;
  
    if (localStorage['checked'] === undefined || localStorage['checked'] === null) {
      arr = [id];
      localStorage.setItem('checked', arr);
    }
    else {
      let len = localStorage.getItem('checked').length;
      arr = localStorage.getItem('checked').split(',');
      len >= 1 ?  arr = [...arr, id] : arr = [id];
      localStorage.setItem('checked', arr);
    }  
  };  

  /* Clear everything */
  let c = document.getElementById('clear');
  c.onclick = function() {
    document.getElementById('inp').value = '';
    let table = document.getElementById('jsonData');
    table.innerHTML = "";
    let tHead = document.getElementById('table');
    tHead.style.display = 'none';
    refreshCheckboxes = false;
    localStorage.removeItem('savedInp');
    localStorage.removeItem('checked');
}

/* onsubmit */
let b = document.getElementById('submit');
b.onclick = function() {
  let inp = document.getElementById('inp').value.toLowerCase();
  console.log(inp);
  refreshCheckboxes = true;
  fetcher(inp);
}

function makeTable(data) {
  let count = 0;
  let tHead = document.getElementById('table');
  tHead.style.display = 'block';

  data.forEach(el => {
    let table = document.getElementById('jsonData');
    let row = table.insertRow(count);  
    let num = row.insertCell(0);
    num.innerHTML = count + 1;
  
    /* insert link, not plain text - unfortunately doesn't work*/
  //  let link = document.createElement('a');
  //  link.setAttribute('href', `${el[1].web_pages}`);
    let webs = row.insertCell(1);
  //  webs.appendChild(link);
     webs.innerHTML = el[1].web_pages; 

    let cCode = row.insertCell(2);
    cCode.innerHTML = el[1].alpha_two_code; 

    let country = row.insertCell(3);
    country.innerHTML = el[1].country;

    let domain = row.insertCell(4);
    domain.innerHTML = el[1].domains;  

    let univ = row.insertCell(5);
    univ.innerHTML = el[1].name;
    
    let ch = document.createElement('INPUT');
    ch.setAttribute('type', 'checkbox');
    ch.setAttribute('id', `${count}`);  

    let ar = localStorage.getItem('checked').split(',');
    if(ar.includes(count.toString()))  ch.setAttribute('checked', 'true');

    let chBox = row.insertCell(6); 
    chBox.appendChild(ch);

    count++;
  });

  let checkboxes = slice(document.querySelectorAll('input[type="checkbox"]'));
  for (let check of checkboxes) check.logic = new  Checkbox(check);
  countChecked();
}

}());

