import { afterEach, before, beforeEach, cy, describe, it } from "local-cypress";
import LoginPage from "../../pageobject/Login/LoginPage";
import { PatientPage } from "../../pageobject/Patient/PatientCreation";
import { UpdatePatientPage } from "../../pageobject/Patient/PatientUpdate";
import { PatientConsultationPage } from "../../pageobject/Patient/PatientConsultation";
import {
  emergency_phone_number,
  phone_number,
} from "../../pageobject/constants";
const yearOfBirth = "2023";

const calculateAge = () => {
  const currentYear = new Date().getFullYear();
  return currentYear - parseInt(yearOfBirth);
};

describe("Patient Creation with consultation", () => {
  const loginPage = new LoginPage();
  const patientPage = new PatientPage();
  const updatePatientPage = new UpdatePatientPage();
  const patientConsultationPage = new PatientConsultationPage();

  before(() => {
    loginPage.loginAsDisctrictAdmin();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.awaitUrl("/patients");
  });

  it("Create a new patient with no consultation", () => {
    patientPage.createPatient();
    patientPage.selectFacility("dummy facility");
    patientPage.enterPatientDetails(
      phone_number,
      emergency_phone_number,
      "Test E2E User",
      "Male",
      "Test Patient Address",
      "682001",
      "1: PAZHAMTHOTTAM",
      "O+",
      "01012001"
    );
    patientPage.clickCreatePatient();

    patientPage.verifyPatientIsCreated();
    patientPage.saveCreatedPatientUrl();
  });

  it("Patient Detail verification post registration", () => {
    patientPage.interceptFacilities();
    patientPage.visitCreatedPatient();
    patientPage.verifyStatusCode();
    const age = calculateAge();
    patientPage.verifyPatientDetails(
      age,
      "Test E2E User",
      phone_number,
      emergency_phone_number,
      yearOfBirth,
      "O+"
    );
  });

  it("Edit the patient details", () => {
    patientPage.interceptFacilities();
    patientPage.visitUpdatePatientUrl();
    patientPage.verifyStatusCode();
    updatePatientPage.enterPatientDetails(
      "Test E2E User Edited",
      "O+",
      phone_number,
      emergency_phone_number,
      "Test Patient Address Edited",
      "Severe Cough",
      "Paracetamol",
      "Dust",
      ["2 months ago", "1 month ago"],
      "SUB123",
      "P123",
      "GICOFINDIA",
      "GICOFINDIA"
    );
    updatePatientPage.clickUpdatePatient();

    updatePatientPage.verifyPatientUpdated();
    updatePatientPage.saveUpdatedPatientUrl();
  });

  it("Patient Detail verification post edit", () => {
    patientPage.interceptFacilities();
    updatePatientPage.visitUpdatedPatient();
    patientPage.verifyStatusCode();

    updatePatientPage.verifyPatientDetails(
      "Test E2E User Edited",
      phone_number,
      "Severe Cough",
      "Paracetamol",
      "Dust"
    );
  });

  it("Create a New consultation to existing patient", () => {
    patientPage.interceptFacilities();
    updatePatientPage.visitConsultationPage();
    patientPage.verifyStatusCode();
    patientConsultationPage.fillIllnessHistory("history");
    patientConsultationPage.selectConsultationStatus("Out-patient (walk in)");
    patientConsultationPage.selectSymptoms("ASYMPTOMATIC");

    patientConsultationPage.enterConsultationDetails(
      "Examination details and Clinical conditions",
      "70",
      "170",
      "IP007",
      "generalnote",
      "generalnote"
    );
    patientConsultationPage.submitConsultation();
    // Below code for the prescription module only present while creating a new consultation
    patientConsultationPage.clickAddPrescription();
    patientConsultationPage.interceptMediaBase();
    patientConsultationPage.selectMedicinebox();
    patientConsultationPage.waitForMediabaseStatusCode();
    patientConsultationPage.prescribeMedicine();
    patientConsultationPage.enterDosage("3");
    patientConsultationPage.selectDosageFrequency("Twice daily");
    patientConsultationPage.submitPrescriptionAndReturn();
  });

  it("Edit created consultation to existing patient", () => {
    updatePatientPage.visitUpdatedPatient();
    patientConsultationPage.visitEditConsultationPage();
    patientConsultationPage.selectConsultationStatus(
      "Referred from other hospital"
    );
    patientConsultationPage.updateSymptoms("FEVER");
    patientConsultationPage.setSymptomsDate("01082023");
    patientConsultationPage.updateConsultation();
    patientConsultationPage.verifySuccessNotification(
      "Consultation updated successfully"
    );
  });

  it("Create Patient shift requests.", () => {
    updatePatientPage.visitUpdatedPatient();
    patientConsultationPage.visitShiftRequestPage();
    patientConsultationPage.enterPatientShiftDetails(
      "Test User",
      "+919120330220",
      "Dummy Shifting",
      "Reason"
    );
    patientConsultationPage.createShiftRequest();
    patientConsultationPage.verifySuccessNotification(
      "Shift request created successfully"
    );
  });

  it("Post doctor notes for an already created patient", () => {
    updatePatientPage.visitUpdatedPatient();
    patientConsultationPage.visitDoctorNotesPage();
    patientConsultationPage.addDoctorsNotes("Test Doctor Notes");
    patientConsultationPage.postDoctorNotes();
    patientConsultationPage.verifySuccessNotification(
      "Note added successfully"
    );
  });

  it("Edit prescription for an already created patient", () => {
    updatePatientPage.visitUpdatedPatient();
    patientConsultationPage.visitEditPrescriptionPage();
    patientConsultationPage.discontinuePreviousPrescription();
    patientConsultationPage.verifySuccessNotification(
      "Prescription discontinued"
    );
    patientConsultationPage.clickAddPrescription();
    patientConsultationPage.prescribeMedicine();
    patientConsultationPage.enterDosage("4");
    patientConsultationPage.selectDosageFrequency("Twice daily");
    patientConsultationPage.submitPrescription();
  });

  it("Discharge a patient", () => {
    updatePatientPage.visitUpdatedPatient();
    patientConsultationPage.clickDischargePatient();
    patientConsultationPage.selectDischargeReason("Recovered");
    patientConsultationPage.addDischargeNotes("Discharge notes");
    patientConsultationPage.confirmDischarge();
    patientConsultationPage.verifySuccessNotification(
      "Patient Discharged Successfully"
    );
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });
});
