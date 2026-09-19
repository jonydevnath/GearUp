import { Rating } from "../../../generated/prisma/enums";

export interface IReviewPayload {
  gearItemsId: string;
  rentalOrderId: string;
  rating: Rating;
  comment: string;
}
