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
    } else if (!/^[A-Za-z0-9\/\-#\s]+$/.test(formData.sourceReference)) {
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
    <div className="max-w-xl mx-auto p-6 bg-[#070B16] text-[#E6E4DC] rounded-xl border border-gray-800 shadow-xl">
      <h2 className="text-xl font-bold mb-4 text-[#EB5B38]">Official Road Restriction Notice</h2>

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
            className={`w-full p-2 bg-[#111719] border rounded text-sm text-white focus:outline-none ${
              errors.sourceReference ? 'border-red-500' : 'border-gray-700 focus:border-[#247BFF]'
            }`}
          />
          {errors.sourceReference && <p className="text-xs text-red-400 mt-1">{errors.sourceReference}</p>}
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
            className={`w-full p-2 bg-[#111719] border rounded text-sm text-white focus:outline-none ${
              errors.publicationTime ? 'border-red-500' : 'border-gray-700 focus:border-[#247BFF]'
            }`}
          />
          {errors.publicationTime && <p className="text-xs text-red-400 mt-1">{errors.publicationTime}</p>}
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
              className={`w-full p-2 bg-[#111719] border rounded text-sm text-white focus:outline-none ${
                errors.effectiveStartTime ? 'border-red-500' : 'border-gray-700 focus:border-[#247BFF]'
              }`}
            />
            {errors.effectiveStartTime && <p className="text-xs text-red-400 mt-1">{errors.effectiveStartTime}</p>}
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
              className={`w-full p-2 bg-[#111719] border rounded text-sm text-white focus:outline-none ${
                errors.effectiveEndTime ? 'border-red-500' : 'border-gray-700 focus:border-[#247BFF]'
              }`}
            />
            {errors.effectiveEndTime && <p className="text-xs text-red-400 mt-1">{errors.effectiveEndTime}</p>}
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
            className={`w-full p-2 bg-[#111719] border rounded text-sm text-white focus:outline-none ${
              errors.segment ? 'border-red-500' : 'border-gray-700 focus:border-[#247BFF]'
            }`}
          />
          <datalist id="official-segment-ids">
            {SEGMENTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} · km {s.kmStart}–{s.kmEnd}
              </option>
            ))}
          </datalist>
          {errors.segment && <p className="text-xs text-red-400 mt-1">{errors.segment}</p>}
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
            className="w-full p-2 bg-[#111719] border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-[#247BFF]"
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
            className={`w-full p-2 bg-[#111719] border rounded text-sm text-white focus:outline-none ${
              errors.jurisdiction ? 'border-red-500' : 'border-gray-700 focus:border-[#247BFF]'
            }`}
          />
          {errors.jurisdiction && <p className="text-xs text-red-400 mt-1">{errors.jurisdiction}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2.5 bg-[#247BFF] hover:bg-[#1d63d8] text-white font-semibold rounded-lg transition"
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
        <div className="mt-4 p-3 bg-emerald-950 border border-emerald-800 rounded text-xs text-emerald-300">
          ✔ Validated successfully! Notice object ready for secure publication.
        </div>
      )}
    </div>
  );
};