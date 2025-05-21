import mongoose from "mongoose";
import MachineEnum from "../models/etatmachine.js";

const machineSchema = new mongoose.Schema({
    nomMachine: { type: String, required: true },
    dataSheet : {type: String , required: true},
    etat: {
      type: String,
      enum: [MachineEnum.Fonctionelle, MachineEnum.Enpanne, MachineEnum.Maintenance],
      required: true,
    },
  });
  
  const Machine = mongoose.model("Machine", machineSchema);
  export default Machine;
  