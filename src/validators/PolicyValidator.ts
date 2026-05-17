import { injectable } from "inversify";
import { CreatePolicyDto } from "../dtos/policy.dto";
import { ValidationError } from "../errors/AppError";
import { IPolicyValidator } from "../interfaces/IPolicyValidator";

@injectable()
export class PolicyValidator implements IPolicyValidator {
  private toMinutes(value: string): number {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  }

  validateCreate(data: CreatePolicyDto): void {
    if (data.baseHours <= 0) {
      throw new ValidationError("'baseHours' must be greater than 0");
    }

    if (this.toMinutes(data.coreTimeStart) >= this.toMinutes(data.coreTimeEnd)) {
      throw new ValidationError("'coreTimeStart' must be earlier than 'coreTimeEnd'");
    }
  }
}
