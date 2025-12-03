import { BaseRepository } from "./baseRepository";
import {
  SpecialOccasionBoat,
  SpecialOccasionBoatModel,
} from "../models/package";

export class SpecialOccasionBoatRepository extends BaseRepository<SpecialOccasionBoat> {
  constructor() {
    super(SpecialOccasionBoatModel);
  }
}