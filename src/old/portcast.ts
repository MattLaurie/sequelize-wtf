import { z } from 'zod';

const data = {
  bill_of_lading: {
    bl_no: 'COSU6349613240',
    carrier_no: 'COSU',
    cntr_no: 'BMOU1589176',
    container_event_list_status_info: {
      code: 'SUCCESS',
      metadata: [],
    },
    created: '2019-08-24T14:15:22Z',
    id: 'da420d2e-7657-4b2b-80a9-a6a30e58482c',
    place_of_delivery: 'USORF',
    place_of_delivery_name: 'NORFOLK',
    place_of_receipt: 'GHTEM',
    place_of_receipt_name: 'TEMA',
    pod: 'GHTEM',
    pod_actual_arrival_lt: '2019-08-24T14:15:22Z',
    pod_actual_arrival_lt_from_ais: '2019-08-24T14:15:22Z',
    pod_actual_departure_lt_from_ais: '2019-08-24T14:15:22Z',
    pod_actual_discharge_lt: '2019-08-24T14:15:22Z',
    pod_name: 'TEMA',
    pod_predicted_arrival_lt: '2019-08-24T14:15:22Z',
    pod_predicted_departure_lt: '2019-08-24T14:15:22Z',
    pod_scheduled_arrival_lt: '2019-08-24T14:15:22Z',
    pod_scheduled_arrival_lt_first_seen: '2019-08-24T14:15:22Z',
    pod_scheduled_arrival_lt_from_schedule: '2019-08-24T14:15:22Z',
    pod_scheduled_departure_lt_from_schedule: '2019-08-24T14:15:22Z',
    pod_scheduled_discharge_lt: '2019-08-24T14:15:22Z',
    pod_terminal_name: 'MERIDIAN PORT SERVICE LIMITED',
    pol: 'USORF',
    pol_actual_arrival_lt_from_ais: '2019-08-24T14:15:22Z',
    pol_actual_departure_lt: '2019-08-24T14:15:22Z',
    pol_actual_departure_lt_from_ais: '2019-08-24T14:15:22Z',
    pol_actual_loading_lt: '2019-08-24T14:15:22Z',
    pol_name: 'NORFOLK',
    pol_predicted_arrival_lt: '2019-08-24T14:15:22Z',
    pol_predicted_departure_lt: '2019-08-24T14:15:22Z',
    pol_scheduled_arrival_lt_from_schedule: '2019-08-24T14:15:22Z',
    pol_scheduled_departure_lt: '2019-08-24T14:15:22Z',
    pol_scheduled_departure_lt_first_seen: '2019-08-24T14:15:22Z',
    pol_scheduled_departure_lt_from_schedule: '2019-08-24T14:15:22Z',
    pol_scheduled_loading_lt: '2019-08-24T14:15:22Z',
    pol_terminal_name: 'PPCY EMPTY DEPOT',
    updated: '2019-08-24T14:15:22Z',
  },
  bill_of_lading_bookmark: {
    bl_no: 'ONEYANRB31646600',
    carrier_no: 'ONEY',
    cntr_no: 'TLLU1181321',
    created: '2019-08-24T14:15:22Z',
    deleted: false,
    derived_carrier_no: 'ONEY',
    id: 'da420d2e-7657-4b2b-80a9-a6a30e58482c',
    org_id: 'f4b40919-a628-4ae3-aefe-b23268b56e4b',
    status: 'string',
    status_code: 'string',
    status_info: {
      code: 'UPLOADED',
      metadata: [],
    },
    system_deleted: false,
    updated: '2019-08-24T14:15:22Z',
  },
  container_event_list: [
    {
      created: '2019-08-24T14:15:22Z',
      event_raw: 'Empty container pick-up',
      event_time: '2019-08-24T14:15:22Z',
      event_time_estimated: '2019-08-24T14:15:22Z',
      event_type_code: 'PICKUP',
      event_type_name: 'Empty container pick-up',
      id: 'c5f7acd1-28e6-4d98-996f-c214418adcc3',
      location_raw: 'Xiamen',
      location_type_code: 'POR',
      location_type_name: 'Place of receipt',
      mode_of_transport: 'TRUCK',
      port_code: 'CNXMG',
      port_name: 'XIAMEN',
      terminal_details: {},
      updated: '2019-08-24T14:15:22Z',
      vessel_imo: 9751107,
      vessel_name: 'GEMLIK EXPRESS',
    },
  ],
  container_metadata: {
    cntr_no: 'TLLU1181321',
    detail_st: '42G1',
    external_height_ft: 8.51,
    external_length_ft: 40,
    external_width_ft: 7.99,
  },
  co2_emissions: {
    total: 0,
    wtt: 0,
    ttw: 0,
    intensity: 0,
  },
  delay_lists: [
    {
      created: '2019-08-24T14:15:22Z',
      delay_description: 'Container rolled over to another vessel at POL',
      location_type_code: 'POL',
      port_code: 'CNXMG',
      port_name: 'XIAMEN',
      reason_code: 'RLV',
      rotation_change: {
        comparison_schedule: [],
        updated_schedule: [],
      },
      schedule_change: [{}],
      vessel_change: {},
    },
  ],
  response_id: '8d328ae1-5151-4cc0-8d8e-b9adb6dbbc69',
  msg: 'Obtained latest bill of lading and container tracking information',
  org_id: 'f4b40919-a628-4ae3-aefe-b23268b56e4b',
  sailing_info_tracking: [
    {
      ais: {},
      sailing_info: {},
      status_info: {
        prediction: {},
        vessel: {},
      },
      voyage_details: [{}],
      msg: 'AIS successfully fetched',
      success: true,
    },
  ],
  status_info: {
    code: 'SUCCESS',
    metadata: [],
  },
  success: true,
  transport_plan: [
    {
      destination_location_code: 'USORF',
      destination_location_name: 'NORFOLK',
      leg: 1,
      mode_of_transport: 'VESSEL',
      source_location_code: 'GHTEM',
      source_location_name: 'TEMA',
    },
  ],
};

export enum StatusInfoCode {
  UPLOADED = 'UPLOADED',
  BL_NOT_FOUND = 'BL_NOT_FOUND',
  CNTR_NOT_FOUND = 'CNTR_NOT_FOUND',
  INVALID_BL_NO = 'INVALID_BL_NO',
  CNTR_NOT_MAPPED_TO_BL = 'CNTR_NOT_MAPPED_TO_BL',
  EARLY_JOURNEY = 'EARLY_JOURNEY',
  DATA_FROM_PROVIDER_INTERRUPTED = 'DATA_FROM_PROVIDER_INTERRUPTED',
  JOURNEY_IN_PROGRESS = 'JOURNEY_IN_PROGRESS',
  JOURNEY_COMPLETED = 'JOURNEY_COMPLETED',
}

const billOfLadingBookmarkSchema = z.object({
  bl_no: z.string().nullable(),
  carrier_no: z.string(),
  cntr_no: z.string(),
  created: z.string().datetime(),
  deleted: z.boolean(),
  derived_carrier_no: z.string().nullable(),
  id: z.string().uuid(),
  org_id: z.string().uuid(),
  status_info: z.object({
    code: z.nativeEnum(StatusInfoCode),
    metadata: z.array(z.never()), // TODO shenanigans
  }),
  system_deleted: z.boolean(),
  updated: z.string().datetime(),
});

const registerSchema = z.object({
  obj: billOfLadingBookmarkSchema,
});

const scacSchema = z.array(
  z.object({
    bl_prefixes: z.array(z.string()),
    full_name: z.string(),
    name: z.string(),
    scac: z.string(),
    scac_synonyms: z.array(z.string()),
    supported_status: z.string().nullable(),
    updated: z.string().datetime(),
  })
);

console.log(
  'register',
  registerSchema.parse({
    obj: {
      bl_no: 'ONEYANRB31646600',
      carrier_no: 'ONEY',
      cntr_no: 'TLLU1181321',
      created: '2019-08-24T14:15:22Z',
      deleted: false,
      derived_carrier_no: 'ONEY',
      id: 'da420d2e-7657-4b2b-80a9-a6a30e58482c',
      org_id: 'f4b40919-a628-4ae3-aefe-b23268b56e4b',
      status: 'string',
      status_code: 'string',
      status_info: {
        code: 'UPLOADED',
        metadata: [],
      },
      system_deleted: false,
      updated: '2019-08-24T14:15:22Z',
    },
  })
);
console.log(
  'scac',
  scacSchema.parse([
    {
      bl_prefixes: ['MEDU'],
      full_name: 'MEDITERRANEAN SHIPPING COMPANY',
      name: 'MSC',
      scac: 'MSCU',
      scac_synonyms: ['MEDU'],
      supported_status: 'string',
      updated: '2019-08-24T14:15:22Z',
    },
  ])
);

async function register({
  carrier_no,
  bl_no,
  cntr_no,
  callback_url,
}: {
  carrier_no: string;
  bl_no?: string;
  cntr_no: string;
  callback_url?: string;
}): Promise<{ reference: string }> {
  const response = await fetch('https://api.portcast.io/api/v2/eta/bill-of-lading-bookmarks', {
    method: 'POST',
    headers: {
      'x-customer': '',
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-api-key': '',
    },
    body: JSON.stringify({
      carrier_no,
      bl_no,
      cntr_no,
      callback_url,
    }),
  });
  const data = await response.json();
  const parse = registerSchema.parse(data);
  return {
    reference: parse.obj.id,
  };
}
