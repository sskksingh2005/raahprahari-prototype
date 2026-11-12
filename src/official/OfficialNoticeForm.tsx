import React, { useState } from 'react';
import { OfficialNoticeFormData, OfficialNoticeFormErrors } from './officialNotice.types';
import { PublishFlow } from './PublishFlow';
import { OfficialSegmentStatus } from './OfficialSegmentStatus';
import { SEGMENTS } from '@/data/fixtures';

export const OfficialNoticeForm: React.FC = () => {
  const [formData, setFormData] = useState<OfficialNoticeFormData>({
    sourceReference: '',
    publicationTime: '',
    effectiveStartTime: '',
    effectiveEndTime: '',
    segment: '',
    restriction: 'Closed',
    jurisdiction: '',
  });

  const [errors, setErrors] = useState<OfficialNoticeFormErrors>({});
  const [submittedData, setSubmittedData] = useState<OfficialNoticeFormData | null>(null);
  const [draft, setDraft] = useState<OfficialNoticeFormData | null>(null);
  const [published, setPublished] = useState<{ noticeId: string; segment: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing/correcting
    if (errors[name as keyof OfficialNoticeFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: OfficialNoticeFormErrors = {};

    // 1. Source reference validation
    if (!formData.sourceReference.trim()) {
      newErrors.sourceReference = 'Source reference is required.';
    } else if (!/^[A-Za-z0-9/\-#\s]+$/.test(formData.sourceReference)) {
      newErrors.sourceReference = 'Invalid format (allowed: letters, numbers, /, #, -).';
    }

    // 2. Publication time validation
    if (!formData.publicationTime) {
      newErrors.publicationTime = 'Publication time is required.';
    }

    // 3. Start time validation
    if (!formData.effectiveStartTime) {
      newErrors.effectiveStartTime = 'Effective start time is required.';
    }

    // 3. End time validation & logical comparison
    if (!formData.effectiveEndTime) {
      newErrors.effectiveEndTime = 'Effective end time is required.';
    } else if (formData.effectiveStartTime && formData.effectiveEndTime <= formData.effectiveStartTime) {
      newErrors.effectiveEndTime = 'End time must be after start time.';
    }

    // 4. Segment validation
    if (!formData.segment.trim()) {
      newErrors.segment = 'Road segment is required.';
    }

    // 6. Jurisdiction validation
    if (!formData.jurisdiction.trim()) {
      newErrors.jurisdiction = 'Jurisdiction / Authority is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedData(null);

    if (validateForm()) {
      console.log("Valid Official Notice Submitted:", formData);
      setSubmittedData(formData);
      setDraft(formData);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-card text-card-foreground rounded-xl border border-border shadow-xl">
      <h2 className="text-xl font-bold mb-4 text-brand-orange">Official Road Restriction Notice</h2>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* 1. Source Reference */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="sourceReference">
            Source Reference *
          </label>
          <input
            type="text"
            id="sourceReference"
            name="sourceReference"
            value={formData.sourceReference}
            onChange={handleChange}
            placeholder="e.g., Order No. 402/Traffic"
            className={`w-full p-2 bg-background border rounded text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              errors.sourceReference ? 'border-destructive' : 'border-input'
            }`}
          />
          {errors.sourceReference && <p className="text-xs text-destructive mt-1">{errors.sourceReference}</p>}
        </div>

        {/* 2. Publication Time */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="publicationTime">
            Publication Time *
          </label>
          <input
            type="datetime-local"
            id="publicationTime"
            name="publicationTime"
            value={formData.publicationTime}
            onChange={handleChange}
            className={`w-full p-2 bg-background border rounded text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              errors.publicationTime ? 'border-destructive' : 'border-input'
            }`}
          />
          {errors.publicationTime && <p className="text-xs text-destructive mt-1">{errors.publicationTime}</p>}
        </div>

        {/* 3. Effective Start & End Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="effectiveStartTime">
              Effective Start Time *
            </label>
            <input
              type="datetime-local"
              id="effectiveStartTime"
              name="effectiveStartTime"
              value={formData.effectiveStartTime}
              onChange={handleChange}
              className={`w-full p-2 bg-background border rounded text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                errors.effectiveStartTime ? 'border-destructive' : 'border-input'
              }`}
            />
            {errors.effectiveStartTime && <p className="text-xs text-destructive mt-1">{errors.effectiveStartTime}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="effectiveEndTime">
              Effective End Time *
            </label>
            <input
              type="datetime-local"
              id="effectiveEndTime"
              name="effectiveEndTime"
              value={formData.effectiveEndTime}
              onChange={handleChange}
              className={`w-full p-2 bg-background border rounded text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                errors.effectiveEndTime ? 'border-destructive' : 'border-input'
              }`}
            />
            {errors.effectiveEndTime && <p className="text-xs text-destructive mt-1">{errors.effectiveEndTime}</p>}
          </div>
        </div>

        {/* 4. Segment */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="segment">
            Road Segment / Stretch *
          </label>
          <input
            type="text"
            id="segment"
            name="segment"
            value={formData.segment}
            onChange={handleChange}
            placeholder="e.g., NH-74 Bypass (Km 42-48)"
            list="official-segment-ids"
            className={`w-full p-2 bg-background border rounded text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              errors.segment ? 'border-destructive' : 'border-input'
            }`}
          />
          <datalist id="official-segment-ids">
            {SEGMENTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} · km {s.kmStart}–{s.kmEnd}
              </option>
            ))}
          </datalist>
          {errors.segment && <p className="text-xs text-destructive mt-1">{errors.segment}</p>}
          <OfficialSegmentStatus
            segmentText={formData.segment}
            heading="Current public status for this segment"
          />

        </div>

        {/* 5. Restriction Type */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="restriction">
            Restriction Type *
          </label>
          <select
            id="restriction"
            name="restriction"
            value={formData.restriction}
            onChange={handleChange}
            className="w-full p-2 bg-background border border-input rounded text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <option value="Closed">Closed</option>
            <option value="One-lane">One-lane</option>
            <option value="Vehicles banned">Vehicles banned</option>
          </select>
        </div>

        {/* 6. Jurisdiction */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="jurisdiction">
            Jurisdiction / Authority *
          </label>
          <input
            type="text"
            id="jurisdiction"
            name="jurisdiction"
            value={formData.jurisdiction}
            onChange={handleChange}
            placeholder="e.g., Dehradun Traffic Police"
            className={`w-full p-2 bg-background border rounded text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              errors.jurisdiction ? 'border-destructive' : 'border-input'
            }`}
          />
          {errors.jurisdiction && <p className="text-xs text-destructive mt-1">{errors.jurisdiction}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-lg transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Submit Notice Draft
        </button>
      </form>

      {draft && (
        <div className="mt-6 p-4 border border-border rounded-lg bg-card shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Ready to Publish</h3>
          <PublishFlow
            draft={draft}
            onSuccess={(noticeId) => {
              setPublished({ noticeId, segment: draft.segment });
              setSubmittedData(null);
              setDraft(null);
            }}
          />
        </div>
      )}

      {published && (
        <div className="mt-6 p-4 border border-border rounded-lg bg-card shadow-sm">
          <p role="status" className="official-banner ok">
            Notice published. ID: {published.noticeId}
          </p>
          <OfficialSegmentStatus
            segmentText={published.segment}
            heading="Public status for this segment"
            note="Prototype: this card shows the seeded advisory. The new notice is not reflected until real persistence is connected."
          />
        </div>
      )}

      {submittedData && (
        <div className="mt-4 p-3 bg-status-clear/10 border border-status-clear rounded text-xs text-foreground">
          ✔ Validated successfully! Notice object ready for secure publication.
        </div>
      )}
    </div>
  );
};