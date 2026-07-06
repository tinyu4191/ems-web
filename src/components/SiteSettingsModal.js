import React, { useState, useRef } from 'react';
import { useSiteProfile } from '../context/SiteProfileContext';
import { useLanguage } from '../context/LanguageContext';
import './SiteSettingsModal.css';

function SiteSettingsModal({ onClose }) {
  const { profile, updateProfile } = useSiteProfile();
  const { t } = useLanguage();
  const [name, setName] = useState(profile.companyName);
  const [logoPreview, setLogoPreview] = useState(profile.logoDataUrl);
  const fileInputRef = useRef(null);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert(t.settings.sizeError);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateProfile({ companyName: name.trim() || 'Tectiiko EMS', logoDataUrl: logoPreview });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{t.settings.title}</div>

        <div className="modal-field">
          <label>{t.settings.companyName}</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tectiiko EMS" />
        </div>

        <div className="modal-field">
          <label>{t.settings.logo}</label>
          <div className="logo-upload-row">
            <div className="logo-preview">
              {logoPreview ? <img src={logoPreview} alt="preview" /> : <span className="logo-preview-placeholder">⚡</span>}
            </div>
            <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
              {t.settings.uploadLogo}
            </button>
            <input
              ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml"
              style={{ display: 'none' }} onChange={handleLogoChange}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>{t.settings.cancel}</button>
          <button className="btn-primary" onClick={handleSave}>{t.settings.save}</button>
        </div>
      </div>
    </div>
  );
}

export default SiteSettingsModal;