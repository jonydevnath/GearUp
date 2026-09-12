export interface IRentalItemInput {
  gearId: string;
  quantity: number;
}

export interface IRentalsPayload {
  startDate: string;
  endDate: string;
  items: IRentalItemInput[];
}

