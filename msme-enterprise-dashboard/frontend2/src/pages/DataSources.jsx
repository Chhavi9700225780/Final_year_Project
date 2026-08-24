/*

 import { useRef, useState } from "react";

import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
  Database,
} from "lucide-react";

import { uploadDataset } from "../services/api";

const DataSources = () => {

  const fileInputRef = useRef(null);

  const [department, setDepartment] =
    useState("production");

  const [file, setFile] =
    useState(null);

  const [dragging, setDragging] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  // ==========================================
  // File Validation
  // ==========================================

  const validateFile = (selectedFile) => {

    if (!selectedFile) {
      return false;
    }

    const allowedTypes = [
      ".csv",
      ".xlsx",
    ];

    const extension =
      selectedFile.name
        .substring(
          selectedFile.name.lastIndexOf(".")
        )
        .toLowerCase();

    if (!allowedTypes.includes(extension)) {

      setError(
        "Only CSV and Excel (.xlsx) files are allowed."
      );

      return false;
    }

    if (
      selectedFile.size >
      20 * 1024 * 1024
    ) {

      setError(
        "File size must be less than 20 MB."
      );

      return false;
    }

    setError("");

    return true;
  };

  // ==========================================
  // Select File
  // ==========================================

  const handleFileSelect = (
    selectedFile
  ) => {

    if (
      validateFile(selectedFile)
    ) {

      setFile(selectedFile);

      setResult(null);
    }
  };

  // ==========================================
  // Input Change
  // ==========================================

  const handleInputChange = (event) => {

    const selectedFile =
      event.target.files[0];

    handleFileSelect(
      selectedFile
    );
  };

  // ==========================================
  // Drag Events
  // ==========================================

  const handleDragOver = (event) => {

    event.preventDefault();

    setDragging(true);
  };

  const handleDragLeave = (event) => {

    event.preventDefault();

    setDragging(false);
  };

  const handleDrop = (event) => {

    event.preventDefault();

    setDragging(false);

    const droppedFile =
      event.dataTransfer.files[0];

    handleFileSelect(
      droppedFile
    );
  };

  // ==========================================
  // Upload
  // ==========================================

  const handleUpload = async () => {

    if (!file) {

      setError(
        "Please select a dataset first."
      );

      return;
    }

    try {

      setUploading(true);

      setError("");

      setResult(null);

      const response =
        await uploadDataset(
          file,
          department
        );

      setResult({
        success: true,

        message:
          response.data.message ||
          "Dataset uploaded successfully.",

        data:
          response.data,
      });

      setFile(null);

      if (fileInputRef.current) {

        fileInputRef.current.value =
          "";
      }

    } catch (err) {

      console.error(
        "Upload error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Dataset upload failed. Please try again."
      );

    } finally {

      setUploading(false);

    }
  };

  // ==========================================
  // Remove File
  // ==========================================

  const removeFile = () => {

    setFile(null);

    setError("");

    if (fileInputRef.current) {

      fileInputRef.current.value =
        "";
    }
  };

  return (

    <div className="data-sources-page">

     

      <div className="dashboard-header">

        <div>

          <h2>
            Data Sources
          </h2>

          <p>
            Upload and integrate departmental
            datasets into the enterprise system.
          </p>

        </div>

        <div className="status">

          <span className="status-dot"></span>

          ETL System Ready

        </div>

      </div>


    

      <div className="upload-card">

        <div className="section-heading">

          <div className="section-icon">

            <Database size={20} />

          </div>

          <div>

            <h3>
              Upload Department Dataset
            </h3>

            <p>
              Supported formats: CSV and Excel
              (.xlsx), maximum size 20 MB.
            </p>

          </div>

        </div>


       

        <div className="form-group">

          <label>
            Department
          </label>

          <select
            value={department}
            onChange={(event) =>
              setDepartment(
                event.target.value
              )
            }
            disabled={uploading}
          >

            <option value="production">
              Production
            </option>

            <option value="inventory">
              Inventory
            </option>

            <option value="raw-materials">
              Raw Materials
            </option>

            <option value="finance">
              Finance
            </option>

            <option value="sales">
              Sales
            </option>

          </select>

        </div>


        <div
          className={
            dragging
              ? "drop-zone dragging"
              : "drop-zone"
          }

          onDragOver={
            handleDragOver
          }

          onDragLeave={
            handleDragLeave
          }

          onDrop={
            handleDrop
          }

          onClick={() =>
            fileInputRef.current?.click()
          }
        >

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={
              handleInputChange
            }
            hidden
          />

          <div className="upload-icon">

            <Upload size={28} />

          </div>

          <h3>
            Drag & Drop your dataset
          </h3>

          <p>
            or click to browse files
          </p>

          <span>
            CSV or XLSX • Maximum 20 MB
          </span>

        </div>



        {file && (

          <div className="selected-file">

            <div className="file-info">

              <div className="file-icon">

                <FileSpreadsheet
                  size={22}
                />

              </div>

              <div>

                <strong>
                  {file.name}
                </strong>

                <span>
                  {(
                    file.size /
                    1024
                  ).toFixed(1)} KB
                </span>

              </div>

            </div>

            <button
              className="remove-file"
              onClick={
                (event) => {
                  event.stopPropagation();
                  removeFile();
                }
              }
              disabled={uploading}
            >
              <XCircle size={19} />
            </button>

          </div>

        )}


        

        {error && (

          <div className="message error">

            <XCircle size={18} />

            <span>
              {error}
            </span>

          </div>

        )}


        

        {result?.success && (

          <div className="message success">

            <CheckCircle2
              size={18}
            />

            <span>
              {result.message}
            </span>

          </div>

        )}


       

        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={
            !file ||
            uploading
          }
        >

          {uploading ? (

            <>
              <Loader2
                size={18}
                className="spin"
              />

              Processing Dataset...
            </>

          ) : (

            <>
              <Upload size={18} />

              Upload Dataset
            </>

          )}

        </button>

      </div>

    </div>

  );
};

export default DataSources;

*/


import { useRef, useState } from "react"
import { uploadDataset } from "../services/api"
import "./styles/DataSources.css"

// ─── ETL Pipeline nodes ───────────────────────────────────────────────
const PIPELINE_NODES = [
  {
    label: "SELECT DEPT",
    sub: "Choose module",
    color: "#818cf8",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <rect x="2" y="4" width="18" height="14" rx="1" />
        <line x1="2" y1="8" x2="20" y2="8" />
        <line x1="6" y1="4" x2="6" y2="8" />
        <line x1="16" y1="4" x2="16" y2="8" />
      </svg>
    ),
  },
  {
    label: "LOAD FILE",
    sub: "CSV / XLSX",
    color: "#a78bfa",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14v4h14v-4" />
        <polyline points="11,3 11,14" />
        <polyline points="7,10 11,14 15,10" />
      </svg>
    ),
  },
  {
    label: "PROCESS ETL",
    sub: "Ingest data",
    color: "#34d399",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <circle cx="11" cy="11" r="9" />
        <path d="M7 11l3 3 5-5" />
      </svg>
    ),
  },
]

// ─── DataSources / Workforce page ─────────────────────────────────────
export default function DataSources() {
  const fileInputRef = useRef(null)
const [departmentOpen, setDepartmentOpen] = useState(false)
  const [department, setDepartment] = useState("production")
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  // ── File validation (original logic) ──
  const validateFile = (selectedFile) => {
    if (!selectedFile) return false
    const allowedTypes = [".csv", ".xlsx"]
    const extension = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase()
    if (!allowedTypes.includes(extension)) {
      setError("Only CSV and Excel (.xlsx) files are allowed.")
      return false
    }
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("File size must be less than 20 MB.")
      return false
    }
    setError("")
    return true
  }

  // ── Select file (original logic) ──
  const handleFileSelect = (selectedFile) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile)
      setResult(null)
    }
  }

  // ── Input change (original logic) ──
  const handleInputChange = (event) => {
    const selectedFile = event.target.files?.[0] ?? null
    handleFileSelect(selectedFile)
  }

  // ── Drag events (original logic) ──
  const handleDragOver = (event) => {
    event.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    const droppedFile = event.dataTransfer.files[0] ?? null
    handleFileSelect(droppedFile)
  }

  // ── Upload (original logic) ──
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a dataset first.")
      return
    }
    try {
      setUploading(true)
      setError("")
      setResult(null)
      const response = await uploadDataset(file, department)
      setResult({
        success: true,
        message: (response.data ).message || "Dataset uploaded successfully.",
        data: response.data,
      })
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (err) {
      console.error("Upload error:", err)
      setError(err.response?.data?.message || "Dataset upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  // ── Remove file (original logic) ──
  const removeFile = () => {
    setFile(null)
    setError("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const activeNodeIdx = file ? 1 : 0

  return (
    <div className="ds-root">

      {/* ── Header ── */}
      <div className="ds-header">
        <div className="ds-header-stripe" />
        <div className="ds-header-left">
          <div className="ds-header-accent" />
          <div className="ds-header-text">
            <span className="ds-module-id">MOD-07 // DATA INTEGRATION</span>
            <h2 className="ds-title">DATA SOURCES</h2>
            <span className="ds-subtitle">Upload and integrate departmental datasets into the enterprise system</span>
          </div>
        </div>
        <div className="ds-header-right">
          <div className="ds-status-chip">
            <span className="ds-status-dot" />
            ETL SYSTEM READY
          </div>
        </div>
      </div>

      {/* ── ETL Pipeline Visualization ── */}
      <div className="ds-pipeline-panel">
        <div className="ds-pipeline-label">ETL PIPELINE — SELECT DEPARTMENT → LOAD FILE → PROCESS DATASET</div>
        <div className="ds-pipeline-nodes">
          {PIPELINE_NODES.map((node, i) => (
            <>
              <div className="ds-pipe-node" key={node.label}>
                <div
                  className={`ds-pipe-icon${i <= activeNodeIdx ? " active" : ""}`}
                  style={{
                    borderColor: i <= activeNodeIdx ? `${node.color}55` : "var(--border-steel)",
                    background: i <= activeNodeIdx ? `${node.color}12` : "var(--forge-dark)",
                    color: i <= activeNodeIdx ? node.color : "var(--text-faint)",
                    boxShadow: i <= activeNodeIdx ? `0 0 16px ${node.color}22` : "none",
                  }}
                >
                  {node.icon}
                </div>
                <span className="ds-pipe-label" style={{ color: i <= activeNodeIdx ? "var(--text-bright)" : "var(--text-faint)" }}>
                  {node.label}
                </span>
                <span className="ds-pipe-sub">{node.sub}</span>
              </div>
              {i < PIPELINE_NODES.length - 1 && (
                <div
                  className="ds-pipe-connector"
                  key={`conn-${i}`}
                  style={{ background: i < activeNodeIdx ? `${PIPELINE_NODES[i].color}44` : "var(--border-steel)" }}
                />
              )}
            </>
          ))}
        </div>
      </div>

      {/* ── Upload Card ── */}
      <div className="ds-upload-card">
        <div className="ds-upload-card-header">
          <div className="ds-upload-tab" />
          <div className="ds-upload-titles">
            <span className="ds-upload-name">UPLOAD DEPARTMENT DATASET</span>
            <span className="ds-upload-sub">Supported formats: CSV and Excel (.xlsx), maximum size 20 MB</span>
          </div>
        </div>

        <div className="ds-upload-body">

          {/* Department selector */}
          <div>
            <label className="ds-field-label">TARGET DEPARTMENT</label>
            <div className="ds-custom-select">

  <button
    type="button"
    className={`ds-select-trigger ${
      departmentOpen ? "open" : ""
    }`}
    onClick={() => !uploading && setDepartmentOpen(!departmentOpen)}
    disabled={uploading}
  >
    <span>
      {department === "production" && "Production"}
      {department === "inventory" && "Inventory"}
      {department === "raw-materials" && "Raw Materials"}
      {department === "finance" && "Finance"}
      {department === "sales" && "Sales"}
    </span>

    <span className="ds-custom-arrow">
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M3 4.5L6 7.5L9 4.5" />
      </svg>
    </span>
  </button>

  {departmentOpen && !uploading && (
    <div className="ds-select-menu">

      {[
        ["production", "Production"],
        ["inventory", "Inventory"],
        ["raw-materials", "Raw Materials"],
        ["finance", "Finance"],
        ["sales", "Sales"],
      ].map(([value, label]) => (
        <button
          type="button"
          key={value}
          className={`ds-select-option ${
            department === value ? "selected" : ""
          }`}
          onClick={() => {
            setDepartment(value)
            setDepartmentOpen(false)
          }}
        >
          <span className="ds-option-index">
            {String(
              [
                "production",
                "inventory",
                "raw-materials",
                "finance",
                "sales",
              ].indexOf(value) + 1
            ).padStart(2, "0")}
          </span>

          <span>{label}</span>

          {department === value && (
            <span className="ds-option-check">✓</span>
          )}
        </button>
      ))}

    </div>
  )}

</div>
          </div>

          {/* Drop zone */}
          <div
            className={`ds-drop-zone${dragging ? " dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={handleInputChange}
              hidden
            />
            <div className="ds-drop-icon">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 18v4h18v-4" />
                <polyline points="13,4 13,18" />
                <polyline points="8,10 13,4 18,10" />
              </svg>
            </div>
            <h3 className="ds-drop-title">Drag &amp; Drop your dataset</h3>
            <p className="ds-drop-sub">or click to browse files</p>
            <span className="ds-drop-formats">CSV or XLSX &nbsp;•&nbsp; Maximum 20 MB</span>
          </div>

          {/* Selected file */}
          {file && (
            <div className="ds-file-selected">
              <div className="ds-file-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                  <rect x="3" y="2" width="14" height="16" rx="1" />
                  <line x1="6" y1="7" x2="14" y2="7" />
                  <line x1="6" y1="10" x2="14" y2="10" />
                  <line x1="6" y1="13" x2="10" y2="13" />
                </svg>
              </div>
              <div>
                <strong className="ds-file-name">{file.name}</strong>
                <span className="ds-file-size">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <button
                className="ds-remove-btn"
                onClick={(e) => { e.stopPropagation(); removeFile() }}
                disabled={uploading}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="9" cy="9" r="8" />
                  <line x1="6" y1="6" x2="12" y2="12" />
                  <line x1="12" y1="6" x2="6" y2="12" />
                </svg>
              </button>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="ds-message ds-message-error">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="6" /><line x1="7" y1="4.5" x2="7" y2="7.5" /><circle cx="7" cy="10" r="0.6" fill="currentColor" /></svg>
              {error}
            </div>
          )}

          {/* Success message */}
          {result?.success && (
            <div className="ds-message ds-message-success">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="6" /><path d="M4.5 7l2 2 3-3" /></svg>
              {result.message}
            </div>
          )}

          {/* Upload button */}
          <button className="ds-upload-btn" onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="ds-spin">
                  <path d="M14 2A7 7 0 1 1 8 1" />
                </svg>
                PROCESSING DATASET...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12v2h12v-2" />
                  <polyline points="8,2 8,11" />
                  <polyline points="5,7 8,2 11,7" />
                </svg>
                UPLOAD DATASET
              </>
            )}
          </button>

        </div>
      </div>

    </div>
  )
}
