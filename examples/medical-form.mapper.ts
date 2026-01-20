import { compileMapper, flatMap, nullableMap, rename } from "../src";

const mapper = compileMapper<MedicalHistoryForm, MedicalHistory>({
  personalInformation: 'personalInformation',
  diagnoses: nullableMap({
    date: 'date',
    code: 'code',
    name: 'name',
    diagnosingPhysican: 'diagnosingPhysican',
  }),
});

type DiagnoseForm = {
  date: Date;
  code: string;
  name: string;
  diagnosingPhysican: `${string} ${string} ${string}`
}

type PersonalInformationForm = {
  name: string;
  contactNumber: string;
}

type MedicalHistoryForm = {
  personalInformation: PersonalInformationForm;
  diagnoses?: DiagnoseForm[];
}

type Diagnose = {
  date: Date;
  code: string;
  name: string;
  diagnosingPhysican: `${string} ${string} ${string}`
}

type PersonalInformation = {
  name: string;
  contactNumber: string;
}

type MedicalHistory = {
  personalInformation: PersonalInformation;
  diagnoses: Diagnose[] | null;
}

console.log(mapper.mapMany([{
  personalInformation: {
    name: 'Viktor',
    contactNumber: '+1 244 423-23-56'
  },
}]))