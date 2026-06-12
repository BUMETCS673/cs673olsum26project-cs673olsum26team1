// AI-USAGE SUMMARY
// Tools: Claude Code
// Overall AI Contribution: ~100%
// AI-Assisted Areas: Test structure, mock setup, assertions
// Human Contributions: Test scope and requirements

import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, describe, it, expect } from 'vitest';

vi.mock('../utils/api', () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from '../utils/api';
import ClinicalChecklist from '../components/ClinicalChecklist';

const makePatient = (overrides = {}) => ({
  id: 1,
  consult:     'not complete',
  labs:        'not complete',
  hematology:  'not required',
  nephrology:  'not required',
  dietitian:   'not complete',
  psychologist:'not complete',
  endoscopy:   'not required',
  barium:      'not required',
  cardiology:  'not required',
  colonoscopy: 'not required',
  sleep:       'not required',
  ...overrides,
});

// Row indices: 0 = header, 1 = Consult, 2 = Labs, 3 = Hematology, ...
const COLUMN_ROW_INDEX = {
  consult: 1, labs: 2, hematology: 3, nephrology: 4, dietitian: 5,
  psychologist: 6, endoscopy: 7, barium: 8, cardiology: 9, colonoscopy: 10, sleep: 11,
};

describe('ClinicalChecklist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the Clinical Checklist heading', () => {
      render(<ClinicalChecklist patient={makePatient()} onPatientUpdate={vi.fn()} />);
      expect(screen.getByText('Clinical Checklist')).toBeInTheDocument();
    });

    it('renders all 11 clinical column labels', () => {
      render(<ClinicalChecklist patient={makePatient()} onPatientUpdate={vi.fn()} />);
      ['Consult', 'Labs', 'Hematology', 'Nephrology', 'Dietitian',
        'Psychologist', 'Endoscopy', 'Barium Swallow', 'Cardiology',
        'Colonoscopy', 'Sleep Study',
      ].forEach((label) => expect(screen.getByText(label)).toBeInTheDocument());
    });

    it('renders exactly 11 dropdowns — one per clinical column', () => {
      render(<ClinicalChecklist patient={makePatient()} onPatientUpdate={vi.fn()} />);
      expect(screen.getAllByRole('combobox')).toHaveLength(11);
    });

    it('renders exactly 11 Save buttons — one per clinical column', () => {
      render(<ClinicalChecklist patient={makePatient()} onPatientUpdate={vi.fn()} />);
      expect(screen.getAllByRole('button', { name: /save/i })).toHaveLength(11);
    });

    it('each dropdown contains the five valid checklist options', () => {
      render(<ClinicalChecklist patient={makePatient()} onPatientUpdate={vi.fn()} />);
      const select = screen.getAllByRole('combobox')[0];
      const options = within(select).getAllByRole('option');
      expect(options).toHaveLength(5);
      expect(options.map((o) => o.value)).toEqual(
        ['not required', 'not complete', 'ordered', 'in progress', 'complete']
      );
    });
  });

  describe('dropdown initialization', () => {
    it('pre-selects the dropdown with the current patient value', () => {
      render(<ClinicalChecklist patient={makePatient({ labs: 'ordered' })} onPatientUpdate={vi.fn()} />);
      const labsSelect = screen.getByRole('combobox', { name: 'Change Labs status' });
      expect(labsSelect.value).toBe('ordered');
    });

    it('normalizes not booked to not complete in the dropdown', () => {
      render(<ClinicalChecklist patient={makePatient({ consult: 'not booked' })} onPatientUpdate={vi.fn()} />);
      const consultSelect = screen.getByRole('combobox', { name: 'Change Consult status' });
      expect(consultSelect.value).toBe('not complete');
    });

    it('renders a Not Started badge for a not booked field value', () => {
      render(<ClinicalChecklist patient={makePatient({ consult: 'not booked' })} onPatientUpdate={vi.fn()} />);
      const consultRow = screen.getAllByRole('row')[COLUMN_ROW_INDEX.consult];
      expect(within(consultRow).getByText('Not Started')).toBeInTheDocument();
    });

    it('Save button is disabled when the dropdown value matches the current patient value', () => {
      render(<ClinicalChecklist patient={makePatient({ labs: 'complete' })} onPatientUpdate={vi.fn()} />);
      const labsRow = screen.getAllByRole('row')[COLUMN_ROW_INDEX.labs];
      expect(within(labsRow).getByRole('button', { name: /save/i })).toBeDisabled();
    });

    it('Save button is enabled when current value is not booked (normalized differs from stored)', () => {
      render(<ClinicalChecklist patient={makePatient({ consult: 'not booked' })} onPatientUpdate={vi.fn()} />);
      const consultRow = screen.getAllByRole('row')[COLUMN_ROW_INDEX.consult];
      expect(within(consultRow).getByRole('button', { name: /save/i })).not.toBeDisabled();
    });
  });

  describe('dropdown interaction', () => {
    it('enables the Save button after changing the dropdown value', async () => {
      const user = userEvent.setup();
      render(<ClinicalChecklist patient={makePatient({ labs: 'not complete' })} onPatientUpdate={vi.fn()} />);
      const labsSelect = screen.getByRole('combobox', { name: 'Change Labs status' });
      const labsRow = screen.getAllByRole('row')[COLUMN_ROW_INDEX.labs];
      const saveButton = within(labsRow).getByRole('button', { name: /save/i });

      expect(saveButton).toBeDisabled();
      await user.selectOptions(labsSelect, 'complete');
      expect(saveButton).not.toBeDisabled();
    });

    it('re-disables the Save button when dropdown is changed back to the original value', async () => {
      const user = userEvent.setup();
      render(<ClinicalChecklist patient={makePatient({ labs: 'not complete' })} onPatientUpdate={vi.fn()} />);
      const labsSelect = screen.getByRole('combobox', { name: 'Change Labs status' });
      const labsRow = screen.getAllByRole('row')[COLUMN_ROW_INDEX.labs];
      const saveButton = within(labsRow).getByRole('button', { name: /save/i });

      await user.selectOptions(labsSelect, 'ordered');
      expect(saveButton).not.toBeDisabled();
      await user.selectOptions(labsSelect, 'not complete');
      expect(saveButton).toBeDisabled();
    });
  });

  describe('save behavior', () => {
    it('calls apiRequest with the correct endpoint, method, column, and value on save', async () => {
      const user = userEvent.setup();
      apiRequest.mockResolvedValue(makePatient({ labs: 'complete' }));
      render(<ClinicalChecklist patient={makePatient({ labs: 'not complete' })} onPatientUpdate={vi.fn()} />);

      await user.selectOptions(screen.getByRole('combobox', { name: 'Change Labs status' }), 'complete');
      await user.click(within(screen.getAllByRole('row')[COLUMN_ROW_INDEX.labs]).getByRole('button', { name: /save/i }));

      expect(apiRequest).toHaveBeenCalledWith('/patients/1/clinical', {
        method: 'PATCH',
        body: JSON.stringify({ column: 'labs', value: 'complete' }),
      });
    });

    it('shows Saving… and disables the button while the request is in flight', async () => {
      const user = userEvent.setup();
      let resolveRequest;
      apiRequest.mockReturnValue(new Promise((r) => { resolveRequest = r; }));
      render(<ClinicalChecklist patient={makePatient({ labs: 'not complete' })} onPatientUpdate={vi.fn()} />);

      await user.selectOptions(screen.getByRole('combobox', { name: 'Change Labs status' }), 'complete');
      await user.click(within(screen.getAllByRole('row')[COLUMN_ROW_INDEX.labs]).getByRole('button', { name: /save/i }));

      const savingButton = await screen.findByRole('button', { name: /saving/i });
      expect(savingButton).toBeDisabled();
      resolveRequest(makePatient({ labs: 'complete' }));
    });

    it('calls onPatientUpdate with the API response after a successful save', async () => {
      const user = userEvent.setup();
      const updatedPatient = makePatient({ labs: 'complete' });
      apiRequest.mockResolvedValue(updatedPatient);
      const onPatientUpdate = vi.fn();
      render(<ClinicalChecklist patient={makePatient({ labs: 'not complete' })} onPatientUpdate={onPatientUpdate} />);

      await user.selectOptions(screen.getByRole('combobox', { name: 'Change Labs status' }), 'complete');
      await user.click(within(screen.getAllByRole('row')[COLUMN_ROW_INDEX.labs]).getByRole('button', { name: /save/i }));

      await waitFor(() => expect(onPatientUpdate).toHaveBeenCalledWith(updatedPatient));
    });

    it('shows an error message when the save fails', async () => {
      const user = userEvent.setup();
      apiRequest.mockRejectedValue(new Error('Network error'));
      render(<ClinicalChecklist patient={makePatient({ labs: 'not complete' })} onPatientUpdate={vi.fn()} />);

      await user.selectOptions(screen.getByRole('combobox', { name: 'Change Labs status' }), 'complete');
      await user.click(within(screen.getAllByRole('row')[COLUMN_ROW_INDEX.labs]).getByRole('button', { name: /save/i }));

      expect(await screen.findByText('Network error')).toBeInTheDocument();
    });

    it('clears the error message when the dropdown is changed after a failed save', async () => {
      const user = userEvent.setup();
      apiRequest.mockRejectedValue(new Error('Network error'));
      render(<ClinicalChecklist patient={makePatient({ labs: 'not complete' })} onPatientUpdate={vi.fn()} />);

      const labsSelect = screen.getByRole('combobox', { name: 'Change Labs status' });
      await user.selectOptions(labsSelect, 'complete');
      await user.click(within(screen.getAllByRole('row')[COLUMN_ROW_INDEX.labs]).getByRole('button', { name: /save/i }));
      await screen.findByText('Network error');

      await user.selectOptions(labsSelect, 'ordered');
      expect(screen.queryByText('Network error')).not.toBeInTheDocument();
    });

    it('shows a fallback error message when the API error has no message', async () => {
      const user = userEvent.setup();
      apiRequest.mockRejectedValue({});
      render(<ClinicalChecklist patient={makePatient({ labs: 'not complete' })} onPatientUpdate={vi.fn()} />);

      await user.selectOptions(screen.getByRole('combobox', { name: 'Change Labs status' }), 'complete');
      await user.click(within(screen.getAllByRole('row')[COLUMN_ROW_INDEX.labs]).getByRole('button', { name: /save/i }));

      expect(await screen.findByText('Failed to save.')).toBeInTheDocument();
    });
  });
});
