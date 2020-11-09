import {createCustomElement, actionTypes} from '@servicenow/ui-core';
const  {COMPONENT_BOOTSTRAPPED} = actionTypes;
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';
import {createHttpEffect} from '@servicenow/ui-effect-http';
import '@servicenow/now-dropdown';
import '@servicenow/now-button';
import '@servicenow/now-template-card';
import '@servicenow/now-modal';

const FILTER_INPUT_CHANGED = 'FILTER_INPUT_CHANGED';
const FILTER_START = 'FILTER_START';
const FILTER_RESET = 'FILTER_RESET';
const ENTER_KEY_CODE = 13;
const SYS_PARMS_FIELDS = 'number, state, priority, short_description, description, sys_id, assignment_group, assigned_to, opened_at, opened_by, resolved_at, resolved_by, closed_at, closed_by';
var STATE_DISPLAY_VALUES_MAP = [];
var PRIORITY_DISPLAY_VALUES_MAP = [];
var ASSIGNMENT_GROUP_DISPLAY_VALUES_MAP = [];
var ASSIGNED_TO_DISPLAY_VALUES_MAP = [];
var OPENED_BY_DISPALY_VALUES_MAP = [];

const view = (state, {dispatch, updateState}) => {

	const {result} = state;
	const {inputValue} = state;
	const {filter} = state;
	const {drawable, preview} = state;


	function FilterTable()
	{
		return (
			<table>
			<tr>
			<td>
			<now-dropdown
			append-to-payload={{label: "field"}}
			items={[{"id":"state","label":"State"},
					{"id":"priority","label":"Priority"},
					{"id":"number","label":"Number"},
					{"id":"assignment_group","label":"Assignment group"},
					{"id":"assigned_to","label":"Assigned to"},
					{"id":"opened_by","label":"Opened by"}]}
			selectedItems={[filter.field]}
			select="single"
			placeholder=""
			icon=""
			variant="secondary"
			size="sm"
			tooltipContent=""
			panelFitProps={{}}
			configAria={{}}>
			</now-dropdown>
			</td>
			<td>
			<now-dropdown
			append-to-payload={{label: "operation"}}
			items={[{"id":"=","label":"="},
					{"id":"!=","label":"!="},
					{"id":">","label":">"},
					{"id":">=","label":">="},
					{"id":"<","label":"<"},
					{"id":"<=","label":"<="}]}
			selectedItems={[filter.operation]}
			select="single"
			placeholder=""
			icon=""
			variant="secondary"
			size="sm"
			tooltipContent=""
			panelFitProps={{}}
			configAria={{}}>
			</now-dropdown>
			</td>
			<td>
			<input
				//autoFocus
				value={filter.value}
				on-input={({target: {value}}) =>
					dispatch(FILTER_INPUT_CHANGED, value.trim())
				}
				on-keypress={({keyCode}) => {
					if (keyCode === ENTER_KEY_CODE && filter.value) {
						dispatch(FILTER_START);
					}
				}}
			/>
			</td>
			<td>
			<now-dropdown
			append-to-payload={{label: "order"}}
			items={[{"id":"order_a_z","label":"A-Z"},
					{"id":"order_z_a","label":"Z-A"}]}
			selectedItems={[filter.order]}
			select="single"
			placeholder=""
			icon=""
			variant="secondary"
			size="sm"
			tooltipContent=""
			panelFitProps={{}}
			configAria={{}}>
			</now-dropdown>
			</td>
			<td>
			<now-button
			label="Filter"
			variant="primary-positive"
			size="sm"
			icon="analytics-center-outline"
			configAria={{}}
			tooltipContent="Run filter with current settings"
			on-click={() =>
				dispatch(FILTER_START)
			}>
			</now-button>
			</td>
			<td>
			<now-button
			label="Reset"
			variant="primary-negative"
			size="sm"
			icon="analytics-center-fill"
			configAria={{}} 
			tooltipContent="Reset filter settings to default and request all incidents"
			on-click={() =>
				dispatch(FILTER_RESET)
			}
			>
			</now-button>
			</td>
			</tr>
			</table>
		)

	}

	function buildIncidentCard(incident)
	{
		return (<now-template-card-assist
			tagline={{ "icon": "tree-view-long-outline", "label": "Incident" }}
			actions={[{ "id": {action: "open", id: incident["number"]["display_value"]}, "label": "Open Record" },
					  { "id": {action: "delete", id: incident["number"]["display_value"]}, "label": "Delete" }]}
			heading={{ "label": incident["short_description"]["display_value"] }}
			content={[{ "label": "Number", "value": { "type": "string", "value": incident["number"]["display_value"] }}, 
					  { "label": "State", "value": { "type": "string", "value": incident["state"]["display_value"] } }, 
					  { "label": "Assignment group", "value": { "type": "string", "value": incident["assignment_group"]["display_value"] } }, 
					  { "label": "Assigned To", "value": { "type": "string", "value": incident["assigned_to"]["display_value"] } }]} 
			contentItemMinWidth="300"
			footerContent={{ "label": "Updated", "value": incident["sys_updated_on"] }} 
			configAria={{}}>
			</now-template-card-assist>);
	}

	function cardListToHTML(list)
	{
		let output = [];
		
		if ((list != null) && (list.length > 0))
		{
			list.forEach(incident => {output.push(buildIncidentCard(incident));});
			

			updateState({drawable : {requireUpdate: false, data: output}})
			return output;
		}
		else return "Loading data...";
	}
	
	return (
		<div>
			<FilterTable/>
			<div>{drawable.requireUpdate ? cardListToHTML(result) : drawable.data}</div>
			<div>{preview.data}</div>
		</div>
	);
};

createCustomElement('x-550126-filter-list', {
	actionHandlers: {
		[COMPONENT_BOOTSTRAPPED]: (coeffects) => {
			const { dispatch } = coeffects;
			dispatch('FETCH_ALL_INCIDENTS')
		},
		'FETCH_ALL_INCIDENTS': (coeffects) => {
			const { dispatch } = coeffects;

			dispatch('FETCH_ALL_INCIDENTS_HTTP', {
				sysparm_display_value: 'all',
				sysparm_fields: SYS_PARMS_FIELDS
			});
		},
		'FETCH_ALL_INCIDENTS_HTTP': createHttpEffect('api/now/table/incident', {
			method: 'GET',
			//pathParams: ['table'],
			queryParams: ['sysparm_display_value','sysparm_fields'],
			successActionType: 'FETCH_ALL_INCIDENTS_SUCCESS'
		}),
		'FETCH_ALL_INCIDENTS_SUCCESS': (coeffects) => {
			const { action, updateState } = coeffects;
			const { result } = action.payload;

			STATE_DISPLAY_VALUES_MAP = result.map((element) => {
				const {value, display_value} = element.state;
				return {value, display_value }});
				
			PRIORITY_DISPLAY_VALUES_MAP = result.map((element) => {
				const {value, display_value} = element.priority;	
				return {value, display_value }});

			
			ASSIGNMENT_GROUP_DISPLAY_VALUES_MAP = result.map((element) => {
				const {value, display_value} = element.assignment_group;	
				return {value, display_value }});


			ASSIGNED_TO_DISPLAY_VALUES_MAP = result.map((element) => {
				const {value, display_value} = element.assigned_to;	
				return {value, display_value }});
				
			OPENED_BY_DISPALY_VALUES_MAP = result.map((element) => {
				const {value, display_value} = element.opened_by;	
				return {value, display_value }});

			updateState({ result, drawable: {requireUpdate: true}});
		},
		'FILTER_INPUT_CHANGED': (coeffects) =>
		{
			const {payload} = coeffects.action;
			const {field, operation, order} = coeffects.state.filter;
		
			coeffects.updateState({filter: {field: field, operation: operation, value: payload, order: order}});
		},
		'FILTER_START': (coeffects) =>
		{
			const {dispatch} = coeffects;
			const {filter} = coeffects.state;

			let map = [];

			switch (filter.field)
			{
				case "state": map =  STATE_DISPLAY_VALUES_MAP; break;
				case "priority": map = PRIORITY_DISPLAY_VALUES_MAP; break;
				case "number": break;
				case "assignment_group": map = ASSIGNMENT_GROUP_DISPLAY_VALUES_MAP; break;
				case "assigned_to": map = ASSIGNED_TO_DISPLAY_VALUES_MAP; break;
				case "opened_by": map = OPENED_BY_DISPALY_VALUES_MAP; break; 
			}

			let value = filter.value;
			let sys_value = map.find(element => element.display_value == filter.value);

			

			if ( sys_value != null) value = sys_value.value;

			dispatch('FETCH_FILTER_INCIDENTS_HTTP', {
				sysparm_display_value: 'all',
				sysparm_query: filter.field + filter.operation + value,
				sysparm_fields: SYS_PARMS_FIELDS
			});

		},
		'FETCH_FILTER_INCIDENTS_HTTP': createHttpEffect('api/now/table/incident', {
			method: 'GET',
			queryParams: ['sysparm_display_value','sysparm_fields', 'sysparm_query'],
			successActionType: 'FETCH_FILTER_INCIDENTS_SUCCESS'
		}),
		'FETCH_FILTER_INCIDENTS_SUCCESS': (coeffects) => {
			const { action, updateState } = coeffects;
			const { result } = action.payload;

			updateState({ result, drawable: {requireUpdate: true}});
		},
		'FILTER_RESET': (coeffects) =>
		{
			const {updateState} = coeffects;
			const {dispatch} = coeffects;
			updateState({filter : {field: "state", operation: "=", value: "New", order: "order_a_z"}});
			dispatch('FETCH_ALL_INCIDENTS_HTTP', {
				sysparm_display_value: 'all',
				sysparm_fields: SYS_PARMS_FIELDS
			});
		},
		'NOW_DROPDOWN#ITEM_CLICKED': (coeffects) =>
		{
			const {updateState, dispatch} = coeffects;
			const {payload} = coeffects.action;
			const {field, operation, value, order} = coeffects.state.filter;

			if (payload.label != null)
			switch (payload.label)
			{
				case "field": 		updateState({filter : {field: payload.item.id	, operation: operation		, value: value, order: order}}); break;
				case "operation": 	updateState({filter : {field: field				, operation: payload.item.id, value: value, order: order}}); break;
				case "order": 		updateState({filter : {field: field				, operation: operation		, value: value, order: payload.item.id}}); break;
				default: dispatch('NOW_DROPDOWN_PANEL#ITEM_CLICKED',{coeffects})
			}
		},
		'NOW_DROPDOWN_PANEL#ITEM_CLICKED': (coeffects) => {
			//coeffects = {action, dispatch, updateState, updateProperties, state, properties};
			const {action, dispatch, updateState} = coeffects;
			const {id} = action.payload.item;

			switch (id.action)
			{
				case "open":	dispatch('OPEN_RECORD_IN_MODAL_WINDOW'	, {item_clicked: id}); break;
				case "delete":	dispatch('DELETE_INCIDENT_FROM_LIST'	, {item_clicked: id}); break;
			}
			
			//updateState({fields});
		},
		'OPEN_RECORD_IN_MODAL_WINDOW':	(coeffects) => {
			const {updateState, state} = coeffects;
			const {item_clicked} = coeffects.action.payload;
			const {result} = state;

			let incident = result.filter((incident) => {
				return incident.number.display_value == item_clicked.id;

			})[0];			
			updateState({preview: {opened: true,
				data: (
				<now-modal
				opened={true}
				size="lg"
				headerLabel={incident.short_description.display_value}
				content=
					{
				<div>
				<table>
					<tr><td>
						<now-label-value-inline label="Number:" value={incident.number.display_value}></now-label-value-inline><br/>
						<now-label-value-inline label="State:" value={incident.state.display_value}></now-label-value-inline><br/>
						<now-label-value-inline label="Priority:" value={incident.priority.display_value}></now-label-value-inline><br/>
						</td>
					</tr>
					<tr>
						<td>
						{(incident.assignment_group.display_value != null)
						 ?
						 (<span><now-label-value-inline label="Assignment group:" value={incident.assignment_group.display_value}></now-label-value-inline><br/></span>)
						 :
					   	 ("")
						}
						{(incident.assignment_group.display_value != null)
						 ?
						 (<span><now-label-value-inline label="Asigned to:" value={incident.assigned_to.display_value} ></now-label-value-inline><br/></span>)
						 :
						 ("")
						}
						</td>
					</tr>
				</table>

				<p>{incident.description.display_value}</p>
				
				<p>
					<now-label-value-inline label="Opened:" value={incident.opened_at.display_value + " by: " + incident.opened_by.display_value}></now-label-value-inline><br/>
					{(incident.resolved_at.display_value != "")
				 	 ?
					 (<span><now-label-value-inline label="Resolved:" value={incident.resolved_at.display_value + " by: " + incident.resolved_by.display_value}></now-label-value-inline><br/></span>)
					 :
					 ("")
					}
					{(incident.closed_at.display_value != "")
					 ?
					 (<span><now-label-value-inline label="Closed:" value={incident.closed_at.display_value + " by: " + incident.closed_by.display_value}></now-label-value-inline><br/></span>)
					 :
					 ("")
					}
				</p>
				</div>}
				
				footerActions="">
				</now-modal>)}});

   				
		},
		'NOW_MODAL#OPENED_SET': (coeffects) => {
			const {updateState} = coeffects;

			updateState({preview:{opened: false}});
		},
		'DELETE_INCIDENT_FROM_LIST':	(coeffects) => {
			const {state, dispatch, updateState} = coeffects;
			const {item_clicked} = coeffects.action.payload;
			const {result} = state;
			
			let incident = result.filter((incident) => {
				return incident.number.display_value == item_clicked.id;
			})[0];

			let new_result = result.filter(element => element.sys_id != incident.sys_id);
			updateState({result: new_result, drawable: {requireUpdate: true}});

			

			dispatch('HTTP_EFFECT_DELETE_ELEMENT',{sys_id: incident.sys_id.value});
		},
		'HTTP_EFFECT_DELETE_ELEMENT': createHttpEffect('api/now/table/incident/:sys_id', {
			method: 'DELETE',
			pathParams: ['sys_id'],
			successActionType: 'DELETE_INCIDENT_ON_SUCCESS',
		}),
		'DELETE_INCIDENT_ON_SUCCESS': (coeffects) => {
			const {dispatch} = coeffects;
			
		},
	},
	
	renderer: {type: snabbdom},
	initialState: {
		result: [],
		inputValue: "DEFAULT",
		filter: {field: "state", operation: "=", value: "New", order: "order_a_z"},
		preview: {opened: false, data: ""},
		drawable: {requireUpdate: true, data: []}
	},
	view,
	styles
});
