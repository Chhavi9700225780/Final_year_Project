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

      {/* =====================================
          Header
      ====================================== */}

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


      {/* =====================================
          Upload Card
      ====================================== */}

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


        {/* =====================================
            Department
        ====================================== */}

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


        {/* =====================================
            Drop Zone
        ====================================== */}

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


        {/* =====================================
            Selected File
        ====================================== */}

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


        {/* =====================================
            Error
        ====================================== */}

        {error && (

          <div className="message error">

            <XCircle size={18} />

            <span>
              {error}
            </span>

          </div>

        )}


        {/* =====================================
            Success
        ====================================== */}

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


        {/* =====================================
            Upload Button
        ====================================== */}

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