
// Base URL for constitution section deep link
const link_prefix = 'https://www.constituteproject.org/constitution/';

// Global for storing the constitution of the selected country. Required to build deep link URL.
let constitution = ''

// Store user's navigation state
let breadcrumbs = {};
// Store entity types in tree depth order
let type_list = ['country','agreement','provision','section'];

// Called when user selects an entity in a table row
function select(index,type,text,wrapper_id) {	
	breadcrumbs[type] = [index,text];
	populate_type(type_list[type_list.indexOf(type)+1],"type");
	depopulate_table(wrapper_id);
	depopulate_table("breadcrumbs_table");
	populate_breadcrumbs(breadcrumbs,"breadcrumbs_table")
	if (type == 'country') {
		// Populate the constitution global
		constitution = get_countries()[index]['constitution']
		populate_table(wrapper_id, get_agreements(index),'agreement');
	} else if (type == 'agreement') {
		populate_table(wrapper_id, get_provisions(breadcrumbs['country'][0],index),'provision');
	} else if (type == 'provision') {
		populate_table(wrapper_id, get_sections(breadcrumbs['country'][0],breadcrumbs['agreement'][0],index),'section');
	}
}

// Called when user selects a breadcrumb
function select_breadcrumb(entity_index,type,text,wrapper_id) {
	// Remove crumbs beyond the selected type
	type_index = type_list.indexOf(type);
	for (let i = type_index+1; i < type_list.length; i++) {
		if (type_list[i] in breadcrumbs) {
			delete breadcrumbs[type_list[i]];
		}
	}
	populate_type(type_list[type_index+1],"type");
	depopulate_table(wrapper_id);
	depopulate_table("breadcrumbs_table");
	populate_breadcrumbs(breadcrumbs,"breadcrumbs_table")
	country_index = breadcrumbs['country'][0];
	if ('agreement' in breadcrumbs) {
		agreement_index = breadcrumbs['agreement'][0];
	}
	if (type == 'country') {
		populate_table(wrapper_id, get_agreements(entity_index),'agreement');
	} else if (type == 'agreement') {
		populate_table(wrapper_id, get_provisions(country_index,entity_index),'provision');
	} else if (type == 'provision') {
		populate_table(wrapper_id, get_sections(country_index,agreement_index,entity_index),'sectionsection');
	}
}

function populate_breadcrumbs(breadcrumbs,wrapper_id) {
	depopulate_table(wrapper_id);
  	let table = document.getElementById(wrapper_id);
	let row = table.insertRow();
	
	// Add countries item to get back to the beginning
	let cell = row.insertCell();
	cell.id = 'countries';
	cell.name = 'countries';	
	cell.addEventListener('click', function(){go_home();}, false);
	cell.className = "breadcrumb"
	cell.appendChild(document.createTextNode('Countries'));

	for (type in breadcrumbs){
		let cell = row.insertCell();
		cell.id = breadcrumbs[type][0];
		cell.name = type;	
		let text = document.createTextNode(breadcrumbs[type][1].textContent);
		cell.addEventListener('click', function(){select_breadcrumb(this.id,this.name,text,"wrapper_table");}, false);
		cell.className = "breadcrumb"
		cell.appendChild(text);
	}	
}

// Populate the main entity table
function populate_table(wrapper_id, siblings, type) {
  	let table = document.getElementById(wrapper_id);
    for (const [i, sib] of siblings.entries()) {
		let row = table.insertRow();
		let cell = row.insertCell();
		cell.id = i;
		cell.name = type;
		cell.className = "horizontalSplit"
		let text = ''
		
		if (type == 'country') {
			text = document.createTextNode(sib.name + ' (' + sib.constitution + ')');
		} else if (type == 'agreement') {
			text = document.createTextNode(sib.id + ' - ' + sib.name + ' - ' + formatDate(sib.date));
		} else if (type == 'provision') {
			text = document.createTextNode(sib.number + ' - ' + sib.text);
		} else {
			// section
			text = createLinkNode(sib.text,sib.number);
		}
		if (type != 'section') {
			cell.addEventListener('click', function(){select(this.id,this.name,text,wrapper_id);}, false);
			cell.style.cursor = "pointer";
		} else {
			cell.style.cursor = "not-allowed";
		}
		cell.appendChild(text);
	}
}

function formatDate(date) {
	// Reformat the integer YYYYMMDD date to DD/MM/YYYY
	return date.slice(7, 8)  + '/' + date.slice(5, 6) + '/' + date.slice(0, 4)
}

function createLinkNode(text, number) {
	// Create a deep link into www.constituteproject.org
	let a = document.createElement('a'); 
	let link = document.createTextNode(number + ' - ' + text);
	a.appendChild(link); 
	a.title = 'Deep link'; 
	a.target = '_blank'; 
	// Build the URL
	let url = link_prefix + constitution + encodeURI('#') + 's' + number;
	a.href = url; 
	return a
}

function populate_type(type,element_id) {
	if (type == 'country') {
		str = "COUNTRY (CONSTITUTION)"
	} else {
		str = type.toUpperCase() + "S"
	}
	document.getElementById(element_id).innerText = str
}

// Currently country level
function go_home(){
 	breadcrumbs = {}
 	populate_type('country',"type")
 	depopulate_table('breadcrumbs_table');
 	depopulate_table('wrapper_table');
	populate_table('wrapper_table', get_countries(), 'country')
}

// Clear table
function depopulate_table(wrapper_id) {
	try {
		let wrapper = document.getElementById(wrapper_id);
		wrapper.innerHTML = ""
	} catch(err){
	}		
}

// Get the countries in the tree
function get_countries() {
	let countries = tree['countries'];
	return countries;
}

// Get the agreements of a country
function get_agreements(country_index) {
	let agreements = get_countries()[country_index]['agreements'];
	return agreements;
}

// Get the provisions of an agreement
function get_provisions(country_index,agreement_index) {
	let provisions = get_agreements(country_index)[agreement_index]['provisions'];
	return provisions;
}

// Get the sections of a constitution
function get_sections(country_index,agreement_index,provision_index) {
	let sections = get_provisions(country_index,agreement_index)[provision_index]['sections'];
	return sections;
}
