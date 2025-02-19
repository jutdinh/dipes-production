import { useParams } from "react-router-dom";

import Papa from "papaparse";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import XLSX from "xlsx-js-style";

const COMPONENT = () => {
  const { lang, proxy, auth, pages, functions } = useSelector((state) => state);

  const { formatNumberWithCommas } = functions;

  const { openTab, renderDateTimeByFormat } = functions;
  const _token = localStorage.getItem("_token");
  const { project_id, version_id, url, id } = useParams();
  let navigate = useNavigate();
  const [dataTables, setDataTables] = useState([]);
  const [dataTable_id, setDataTableID] = useState([]);
  const [dataFields, setDataFields] = useState([]);
  const [apiData, setApiData] = useState([]);
  const [time, setTime] = useState("");
  const [errorSelect, setErrorSelect] = useState(null);
  const [loadingExportFile, setLoadingExportFile] = useState(false);

  const [loadingReadFile, setLoadingReadFile] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [uploadedJson, setUploadedJson] = useState(null);
  const [dataImport, setDataImport] = useState([]);
  const [dataImportTemp, setDataImportTemp] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [rowsImported, setRowsImported] = useState(0);

  const [rowsImportedError, setRowsImportedError] = useState(0);

  const [apiDataName, setApiDataName] = useState([]);
  const [dataStatis, setDataStatis] = useState({});
  const [statusActive, setStatusActive] = useState(false);
  const [errorLoadConfig, setErrorLoadConfig] = useState(false);
  const [effectOneCompleted, setEffectOneCompleted] = useState(false);
  const [page, setPage] = useState([]);
  const [data, setData] = useState({});
  const [selectedFileType, setSelectedFileType] = useState("xlsx");
  const [dataSearch, setdataSearch] = useState([]);
  const [totalSearch, setTotalSearch] = useState(0);
  const [sumerize, setSumerize] = useState(0);
  const [hasSetSumerize, setHasSetSumerize] = useState(false); //lưu count 1 lần
  const [count, setCount] = useState(0);
  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(Number(num))) {
      return "";
    }

    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  };

  const formatNumberSize = (num) => {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  };
  const location = useLocation();

  const goToHomePage = () => {
    // navigate(`/page/${url}`);
    navigate(-1);
  };
  console.log(id);
  useEffect(() => {
    setSearchValues({});
  }, [location.pathname]);

  useEffect(() => {
    if (isImporting) {
      // Hãy thêm mã để hiển thị hình mờ load tại đây.
    } else {
      // Khi import hoàn tất, hãy ẩn hình mờ load tại đây.
    }
  }, [isImporting]);

  useEffect(() => {
    fetch(`${proxy()}/auth/activation/check`, {
      headers: {
        Authorization: _token,
      },
    })
      .then((res) => res.json())
      .then((resp) => {
        const { success, data, activated, status, content } = resp;
        // console.log(resp)
        if (activated) {
          setStatusActive(true);
        } else {
          Swal.fire({
            title: lang["faild"],
            text: lang["fail.active"],
            icon: "error",
            showConfirmButton: true,
            customClass: {
              confirmButton: "swal2-confirm my-confirm-button-class",
            },
          }).then(function () {
            // window.location.reload();
          });
          setStatusActive(false);
        }
        setEffectOneCompleted(true);
      });
  }, []);

  const callApi = () => {
    if (Object.keys(searchValues).length !== 0) {
      setLoadingSearch(true);
    }
    const searchBody = {
      table_id: dataTable_id,
      start_index: currentPage - 1,
      criteria: searchValues,
      require_count: requireCount,
      // exact: true
    };
    // console.log(searchBody)
    fetch(`${proxy()}/api/foreign/data`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        fromIndex: currentPage - 1,
      },
      body: JSON.stringify(searchBody),
    })
      .then((res) => res.json())
      .then((res) => {
        const {
          success,
          content,
          data,
          result,
          total,
          fields,
          statisticValues,
          count,
          sumerize,
        } = res;
        // console.log(res)
        if (success) {
          // setdataSearch(result)
          // setTotalSearch(total)
          // setApiData(data.filter(record => record != undefined))
          setApiDataName(fields);
          setDataStatis(statisticValues);
          setLoaded(true);
          if (count !== undefined) {
            setSumerize(count);
          } else {
            setSumerize(sumerize);
          }
        }
        setLoadingSearch(false);
      });
  };
  useEffect(() => {
    if (page) {
      // const id_str = page.components?.[0]?.api_post.split('/')[2];
      // console.log(id_str)
      fetch(`${proxy()}/apis/api/${id}/input_info`)
        .then((res) => res.json())
        .then((res) => {
          const { data, success, content } = res;
          console.log(res);
          if (success) {
            setDataTables(data.tables);
            setDataTableID(data.tables[0]?.id);
            setDataFields(data.body);
            setLoaded(true);
          }
          // setApi(api);
          callApi();
        });
    }
  }, [page, dataTable_id]);

  useEffect(() => {
    if (page && page.components) {
      fetch(`${proxy()}${page.components?.[0]?.api_get}`)
        .then((res) => res.json())
        .then((res) => {
          const { data, success, fields, content } = res;
          if (success) {
            setApiDataName(fields);
          }
          callApi();
        });
    }
  }, [page, dataTable_id]);

  console.log(apiDataName);

  // useEffect(() => {
  //     if (pages && pages.length > 0) {
  //         const result = pages.find(page => page.url === `/${url}`);
  //         // console.log(result)
  //         if (result) {
  //             setPage(result);
  //         } else {
  //             // openTab('/page/not/found')
  //         }
  //     }
  // }, [pages, url]);
  useEffect(() => {
    if (pages && pages.length > 0) {
      const result = functions.findPageById(pages, `${url}`);

      if (result.component.length > 0) {
        setPage(result);
      } else {
      }
    }
  }, [pages, url]);

  useEffect(() => {
    setCurrentPage(1);
  }, [page, url]);

  const layoutId = page.components?.[0].layout_id;

  // const tableClassName = layoutId === 0 ? "table table-striped" : "table table-hover";
  const tableClassName = "table table-hover";
  const [selectedFile, setSelectedFile] = useState(null);
  const CustomFileInput = ({ onChange, ...props }) => {
    const fileInputRef = useRef(null);

    const handleButtonClick = (event) => {
      event.preventDefault();
      //   console.log("IMPORT");
      fileInputRef.current.click();
      // setUploadedJson(null)
    };

    const handleFileChange = (event) => {
      event.preventDefault();

      setSelectedFile(null);
      setErrorSelect(null);
      setLoadingReadFile(false);
      setUploadedJson([]);
      setSumerize(0);
      setDataImportTemp([]);
      setErrorOccurred(false);

      const supportedExtensions = ["csv", "xlsx", "xls"];

      if (event.target.files.length > 0) {
        const file = event.target.files[0];
        const fileExtension = file.name.split(".").pop().toLowerCase();
        const maxFileSize = 120 * 1024 * 1024; // 5MB
        if (file.size > maxFileSize) {
          setErrorSelect(lang["File size exceeds the allowable limit"]);
          return;
        }
        if (supportedExtensions.includes(fileExtension)) {
          setSelectedFile({
            name: file.name,
            size: file.size,
            type: file.type,
            rawFile: file,
          });
          setErrorSelect(null);
        } else {
          setSelectedFile(null);
          setErrorSelect(lang["check file"]);
        }
      }
    };

    function extractValueInBrackets(value) {
      const matches = value.match(/\(([^)]+)\)/);
      if (matches) {
        return matches[1];
      } else {
        return null;
      }
    }

    const processSelectedFile = (event, bulkUpdate = false) => {
      event.preventDefault();
      if (!selectedFile || !selectedFile.rawFile) return;
      setLoadingReadFile(true);
      const file = selectedFile.rawFile;
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const reader = new FileReader();

      function extractValueInBrackets(value) {
        const matches = value.match(/\(([^)]+)\)/);
        return matches ? matches[1] : null;
      }

      reader.onload = (e) => {
        try {
          const startTime = new Date().getTime();
          let isValidHeader = true;
          let modifiedData;
          const condition_fields = {};
          const unique_fields = {};

          if (fileExtension === "csv") {
            Papa.parse(e.target.result, {
              complete: (result) => {
                for (let key of result.meta.fields) {
                  if (extractValueInBrackets(key) === null) {
                    isValidHeader = false;
                    break;
                  }
                }
                if (!isValidHeader) {
                  setErrorSelect(lang["format"]);
                  setLoadingReadFile(false);
                  return;
                }
                modifiedData = result.data
                  .filter((row) =>
                    Object.values(row).some((value) => value.trim() !== "")
                  )
                  .map((row) => {
                    const newRow = {};
                    for (let key in row) {
                      newRow[extractValueInBrackets(key)] = row[key];
                    }
                    return newRow;
                  });
                const endTime = new Date().getTime();
                const elapsedTime = endTime - startTime;
                // console.log(`---------------------------------TimeResponse: ${elapsedTime} ms`);
                // console.log("Parsed CSV Result:", modifiedData);
              },
              header: true,
            });
          } else if (["xlsx", "xls"].includes(fileExtension)) {
            const startTime = new Date().getTime();
            const workbook = XLSX.read(e.target.result, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            const firstRow = json[0];
            for (let key in firstRow) {
              if (extractValueInBrackets(key) === null) {
                isValidHeader = false;
                break;
              }
            }

            if (!isValidHeader) {
              setErrorSelect(lang["format"]);
              setLoadingReadFile(false);
              return;
            }

            modifiedData = json.map((row) => {
              const newRow = {};

              for (let key in row) {
                const k = extractValueInBrackets(key).split("-");
                if (k.includes("c")) {
                  condition_fields[k[0]] = true;
                } else if (k.includes("u")) {
                  unique_fields[k[0]] = true;
                }

                newRow[k[0]] = row[key];
              }

              return newRow;
            });

            const maxRows = 1100000;
            if (modifiedData.length > maxRows) {
              setErrorSelect(
                lang["Number of rows exceeds the allowable limit"]
              );
              return;
            }
            const endTime = new Date().getTime();
            const elapsedTime = endTime - startTime;
            console.log(
              `---------------------------------TimeResponse: ${elapsedTime} ms`
            );
            // console.log("Parsed Excel Result:", modifiedData);
          }

          if (isValidHeader) {
            setUploadedJson({ data: modifiedData });
            setSumerize(modifiedData.length);
            console.log("BULK UPDATE", bulkUpdate);
            importData(
              { data: modifiedData, condition_fields, unique_fields },
              bulkUpdate
            );
          }

          setLoadingReadFile(false);
        } catch (error) {
          console.error(error);
          setErrorSelect(lang["format"]);
        } finally {
          setLoadingReadFile(false);
        }
      };

      if (fileExtension === "csv") {
        reader.readAsText(file, "ISO-8859-1");
      } else {
        reader.readAsBinaryString(file);
      }
    };

    // console.log(uploadedJson)

    useEffect(() => {
      let timeout;
      if (isInitialRender) {
        setIsInitialRender(false);
        return;
      }

      if (loadingReadFile) {
        Swal.fire({
          title: lang["loading"],
          allowEscapeKey: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      } else if (!errorOccurred) {
        timeout = setTimeout(() => {
          Swal.close();
        }, 500);
      } else {
        clearTimeout(timeout);
      }

      return () => clearTimeout(timeout);
    }, [loadingReadFile, errorOccurred]);

    const fileTypeToReadable = (type) => {
      switch (type) {
        case "text/csv":
          return "CSV";
        case "application/vnd.ms-excel":
          return "Excel (XLS)";
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          return "Excel (XLSX)";
        default:
          return "Không xác định";
      }
    };

    return (
      <div>
        <input
          type="file"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
          {...props}
        />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button onClick={handleButtonClick} className="btn btn-primary">
            {/* <i className="fa fa-file-excel-o"></i>   */}
            {lang["select file"]}
          </button>

          {selectedFile && !errorSelect && (
            <section
              className="d-flex"
              style={{
                gap: "10px",
              }}
            >
              <button
                style={{ width: "87px" }}
                className="btn btn-success ml-auto"
                onClick={processSelectedFile}
              >
                {lang["import"]}
              </button>
              {/* <button
                style={{ width: "87px" }}
                className="btn btn-primary ml-auto"
                onClick={(e) => processSelectedFile(e, true)}
              >
                {lang["bulkUpdate"]}
              </button> */}
            </section>
          )}
        </div>

        {selectedFile && (
          <div className="mt-2">
            <ul>
              <li>
                {" "}
                {lang["selected file"]}: {selectedFile.name}
              </li>
              <li>
                {lang["size"]}:{" "}
                {formatNumberSize((selectedFile.size / 1024).toFixed(0))} KB
              </li>
              <li>
                {lang["type"]}: {fileTypeToReadable(selectedFile.type)}
              </li>
            </ul>
          </div>
        )}
        {errorSelect && <div className="mt-2 text-danger">{errorSelect}</div>}
      </div>
    );
  };

  const [errorOccurred, setErrorOccurred] = useState(false);

  function showErrorAlert() {
    Swal.fire({
      title: lang["error"],
      text: lang["error.format"],
      icon: "error",
      showConfirmButton: true,
    });
  }

  const importData = async (uploadedJson, bulkUpdate = false) => {
    if (!uploadedJson?.data) return;

    const BATCH_SIZE = 1000;
    const totalRows = uploadedJson.data.length;

    let batches = [];

    if (totalRows <= 1000) {
      batches.push(uploadedJson.data);
    } else {
      for (let i = 0; i < totalRows; i += BATCH_SIZE) {
        batches.push(uploadedJson.data.slice(i, i + BATCH_SIZE));
      }
      if (uploadedJson.data.length > 0 && loadingReadFile === false) {
        setIsImporting(true);
      }
    }

    let completedBatches = 0;
    let rowsImported = 0;
    let rowsWithError = 0;

    const startTime = new Date().getTime();

    console.log("BULK UPDATE AFTER ::", uploadedJson);

    for (let batch of batches) {
      const requestBody = {
        data: batch,
      };

      if (bulkUpdate) {
        console.log("ID", id);
        continue;
      }

      try {
        const response = await fetch(`${proxy()}/import/${id}`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const jsonResponse = await response.json();
        const { success } = jsonResponse;
        console.log("jsonResponse", jsonResponse);
        if (!success) {
          console.error(
            "Server did not process batch successfully:",
            jsonResponse
          );
          setErrorOccurred(true);
          showErrorAlert();
          setErrorSelect(lang["format"]);
          return;
        } else {
          completedBatches++;
          if (totalRows <= 1000) {
            rowsImported = totalRows;
          }
          if (completedBatches === batches.length) {
            rowsImported = totalRows;
          } else {
            rowsImported = completedBatches * BATCH_SIZE;
          }
          setRowsImported(rowsImported);
          setDataImportTemp((prevDataImport) => [
            ...prevDataImport,
            ...jsonResponse.data,
          ]);

          const validData = jsonResponse.data.filter(
            (item) =>
              !item.errors?.primary &&
              !item.errors?.duplicate &&
              item.errors?.foreign?.length === 0
          );
          rowsWithError += batch.length - validData.length;
          setRowsImportedError(rowsWithError);

          await importReceivedData(validData);
        }
      } catch (error) {
        console.error("Error sending batch:", error);
        break;
      }
    }

    const endTime = new Date().getTime();

    const elapsedTime = endTime - startTime;
    const elapsedSeconds = elapsedTime / 1000;

    const elapsedMinutes = elapsedTime / (1000 * 60);

    const formattedMinutes = `${elapsedMinutes.toFixed(2)} ${lang["minute"]}`;

    const formattedTime = `${formattedMinutes} (${elapsedSeconds.toFixed(0)}s)`;

    setTime(formattedTime);
    const elapsedHours = elapsedTime / (1000 * 60 * 60);
    console.log(`Giây: ${elapsedSeconds} `);
    // console.log(`Phút ${elapsedMinutes} `);
    // console.log(`Giờ ${elapsedHours} `);

    if (completedBatches === batches.length) {
      setErrorOccurred(true);
      Swal.fire({
        title: lang["import.complete"],
        text: lang["import.text"],
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
      });
      setSelectedFile(null);
    }
    // setSelectedFile(null)
    setIsImporting(false);
  };
  const percentageCompleted = (rowsImported / sumerize) * 100;
  // console.log(rowsImported)
  // console.log(sumerize)

  // const importData = async () => {
  //     if (!uploadedJson?.data) return;

  //     let logCount = 0;
  //     let batches = [];
  //     for (let i = 0; i < uploadedJson.data.length; i += BATCH_SIZE) {
  //         batches.push(uploadedJson.data.slice(i, i + BATCH_SIZE));
  //     }
  //     logCount++;
  //     const requests = batches.map(async (batch, index) => {
  //         const requestBody = {
  //             data: batch,
  //         };

  //         try {

  //             const response = await fetch(`${proxy()}${page.components?.[0]?.api_import}`, {
  //                 method: "POST",
  //                 headers: {
  //                     "content-type": "application/json",
  //                 },
  //                 body: JSON.stringify(requestBody)
  //             });

  //             const jsonResponse = await response.json();
  //             const { success, content, data, result, total, fields, statisticValues, count, sumerize } = jsonResponse;

  //             console.log(jsonResponse)
  //             if (success) {
  //                 setDataImportTemp(prevDataImport => [...prevDataImport, ...jsonResponse.data])
  //                 const validData = jsonResponse.data.filter(item => !(item.errors?.primary || item.errors?.duplicate));
  //                 await importReceivedData(validData);

  //             }
  //             if (!success) {
  //                 console.error("Server did not process batch successfully:", jsonResponse);
  //             }
  //             console.log("Successfully processed batch number:", logCount);
  //         } catch (error) {
  //             console.error("Error in batch:", index, error);
  //         }
  //     });
  //     await Promise.all(requests);
  //     console.log("All batches have been processed");
  // };

  const importReceivedData = async (data) => {
    const requestBody = {
      data: data,
      type: "import",
    };
    // console.log(371, requestBody)
    try {
      const response = await fetch(`${proxy()}/import/${id}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        // console.log("Data has been successfully imported");
      } else {
        console.error("Failed to import data", await response.json());
      }
    } catch (error) {
      console.error("Error sending data to import API:", error);
    }
  };

  useEffect(() => {
    // importData();
  }, [uploadedJson]);

  useEffect(() => {
    if (page && page.components) {
      // const id_str = page.components?.[0]?.api_post.split('/')[2];
      // console.log(id_str)
      fetch(`${proxy()}/apis/api/${id}/input_info`)
        .then((res) => res.json())
        .then((res) => {
          const { data, success, content } = res;
          // console.log(res)
          if (success) {
            setDataTables(data.tables);
            setDataTableID(data.tables[0]?.id);
            setDataFields(data.body);
            setLoaded(true);
          }
          // setApi(api);
        });
    }
  }, [page, dataTable_id]);
  // console.log(dataTable_id)

  const handleCloseModal = () => {
    setSelectedFields([]);
    setSelectedStats([]);
  };
  const [loaded, setLoaded] = useState(false);

  //search
  const [currentPage, setCurrentPage] = useState(0);
  const [requireCount, setRequireCount] = useState(true);
  const [searchValues, setSearchValues] = useState({});
  // const timeoutRef = useRef(null);
  const handleInputChange = (fomular_alias, value) => {
    setSearchValues((prevValues) => ({
      ...prevValues,
      [fomular_alias]: value,
    }));
  };
  // useEffect(() => {
  //     if (currentPage > 1 ) {
  //         setRequireCount(false);
  //     }

  // }, [currentPage]);

  const renderBoolData = (data, field) => {
    const IF_TRUE = field.DEFAULT_TRUE;
    const IF_FALSE = field.DEFAULT_FALSE;
    if (data != undefined) {
      if (data) {
        return IF_TRUE ? IF_TRUE : "true";
      }
      return IF_FALSE ? IF_FALSE : "false";
    } else {
      return IF_FALSE ? IF_FALSE : "false";
    }
  };

  const renderData = (field, data) => {
    if (data) {
      switch (field.DATATYPE) {
        case "DATE":
        case "DATETIME":
          return renderDateTimeByFormat(
            data[field.fomular_alias],
            field.FORMAT
          );
        case "DECIMAL":
        case "DECIMAL UNSIGNED":
          const { DECIMAL_PLACE } = field;
          const decimalNumber = parseFloat(data[field.fomular_alias]);
          return decimalNumber.toFixed(DECIMAL_PLACE);
        case "BOOL":
          return renderBoolData(data[field.fomular_alias], field);
        default:
          return data[field.fomular_alias];
      }
    } else {
      return "Invalid value";
    }
  };

  const rowsPerPage = 18;
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;

  const currentData = dataImportTemp.slice(indexOfFirst, indexOfLast);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalRows = uploadedJson?.data ? uploadedJson?.data.length : 0;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 0;

  // console.log(uploadedJson?.data)

  const [selectedFields, setSelectedFields] = useState([]); /// fields
  const [selectedStats, setSelectedStats] = useState([]);
  const [exportType, setExportType] = useState("excel");

  // statis fields

  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    let timeout;
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }

    if (loadingExportFile) {
      Swal.fire({
        title: lang["loading"],
        allowEscapeKey: false,
        allowOutsideClick: false,

        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      timeout = setTimeout(() => {
        Swal.close();
      }, 1000);

      // Swal.fire({
      //     title: lang["success"],
      //     icon: 'success',
      //     timer: 2000,
      //     showConfirmButton: false
      // });
    }
  }, [loadingExportFile]);
  useEffect(() => {
    let timeout;

    if (loadingSearch) {
      Swal.fire({
        title: "Searching...",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      timeout = setTimeout(() => {
        Swal.close();
      }, 1000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [loadingSearch]);

  function getErrorMessages(row) {
    const errors = [];
    if (row.errors) {
      if (row.errors.primary) {
        errors.push(lang["error.import.primarykey"]);
      }
      if (row.errors.duplicate) {
        errors.push(lang["error.import.duplicate"]);
      }
      if (row.errors.foreign && row.errors.foreign.length > 0) {
        // errors.push(`${lang["error.import.foreign"]}` + ': ' + row.errors.foreign.join(', '));
        errors.push(`${lang["error.import.foreign"]}`);
      }
    }
    return errors.join("; ");
  }

  console.log(functions.getNamePage(page));

  return (
    <div class="midde_cont">
      <div class="container-fluid">
        <div class="row column_title">
          <div class="col-md-12">
            <div class="page_title">
              <h4>{lang["manage data"]}</h4>
            </div>
          </div>
        </div>
        {/* List table */}
        <div class="row">
          <div class="col-md-12">
            <div class="white_shd full margin_bottom_30">
              <div class="full graph_head d-flex">
                <div class="heading1 margin_0 ">
                  {/* <h5>{page?.components?.[0]?.component_name}</h5> */}

                  <h5>
                    {" "}
                    <label class="pointer" onClick={() => goToHomePage()}>
                      <a title={lang["back"]}>
                        <i class=" fa fa-chevron-circle-left mr-1 mt-3 mb-1 nav-item nav-link"></i>
                      </a>
                      {functions.findPropsNameImportByUrl(page, id)}
                    </label>
                    <i
                      class={` ${
                        functions.findPropsNameImportByUrl(page, id)?.trim() !==
                          "" && "fa fa-chevron-right ml-2 mr-1"
                      } `}
                    ></i>
                    Import data
                  </h5>
                </div>
              </div>
              <div
                className={`table_section padding_infor_info ${
                  isImporting ? "loading" : ""
                }`}
              >
                {isImporting && (
                  <>
                    <img
                      width={80}
                      className="scaled-hover-target loading-image"
                      src="/images/icon/load.gif"
                      alt="Loading..."
                    ></img>
                    <div className="import-status">
                      {lang["imported"]}: {percentageCompleted.toFixed()}%
                    </div>
                  </>
                )}
                <div class="col-md-12 mt-2">
                  <CustomFileInput />
                </div>
                {currentData && currentData.length > 0 ? (
                  <div class="col-md-12 mt-2">
                    <p>
                      {lang["total.line"]}: {totalRows}
                    </p>
                    <p>
                      {lang["total.imported"]}:{" "}
                      {rowsImported - rowsImportedError}
                    </p>
                    <p>
                      {lang["total.error"]}: {rowsImportedError}
                    </p>
                    {/* <p>{lang["total.time"]}: {time}</p> */}
                  </div>
                ) : null}

                <div class="col-md-12 my-2">
                  {statusActive ? (
                    <>
                      {
                        dataImport ? (
                          currentData && currentData.length > 0 ? (
                            <>
                              <div class="table-responsive">
                                <table
                                  className={tableClassName}
                                  style={{ marginBottom: "10px" }}
                                >
                                  <thead>
                                    <tr>
                                      <th
                                        class="font-weight-bold "
                                        style={{ width: "100px" }}
                                        scope="col"
                                      >
                                        {lang["log.no"]}
                                      </th>
                                      {dataFields.map((header, index) => (
                                        <th
                                          key={index}
                                          class="font-weight-bold"
                                        >
                                          {header.display_name
                                            ? header.display_name
                                            : header.field_name}
                                        </th>
                                      ))}
                                      <th class="font-weight-bold">
                                        {lang["note"]}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <>
                                      {currentData.map((row, index) => {
                                        if (row) {
                                          const isPrimaryError =
                                            row.errors &&
                                            (row.errors.primary ||
                                              row.errors?.duplicate);
                                          const foreignErrors = row.errors
                                            ? row.errors.foreign
                                            : [];
                                          return (
                                            <tr
                                              key={index}
                                              className={
                                                isPrimaryError
                                                  ? "error-row"
                                                  : ""
                                              }
                                            >
                                              <td scope="row">
                                                {indexOfFirst + index + 1}
                                              </td>
                                              {dataFields.map((header) => (
                                                <td
                                                  key={header.fomular_alias}
                                                  className={
                                                    foreignErrors.includes(
                                                      header.fomular_alias
                                                    )
                                                      ? "foreign-error"
                                                      : ""
                                                  }
                                                >
                                                  {renderData(header, row)}
                                                </td>
                                              ))}
                                              <td>{getErrorMessages(row)}</td>
                                            </tr>
                                          );
                                        } else {
                                          return null;
                                        }
                                      })}
                                    </>
                                  </tbody>
                                </table>
                                <div className="d-flex justify-content-between align-items-center">
                                  {uploadedJson?.data ? (
                                    <p>
                                      {lang["show"]}{" "}
                                      {formatNumber(indexOfFirst + 1)} -{" "}
                                      {formatNumber(
                                        indexOfFirst + currentData.length
                                      )}{" "}
                                      {lang["of"]}{" "}
                                      {formatNumber(uploadedJson?.data.length)}{" "}
                                      {lang["results"]}
                                    </p>
                                  ) : null}

                                  <nav aria-label="Page navigation example">
                                    <ul className="pagination mb-0">
                                      <li
                                        className={`page-item ${
                                          currentPage === 1 ? "disabled" : ""
                                        }`}
                                      >
                                        <button
                                          className="page-link"
                                          onClick={() => paginate(1)}
                                        >
                                          &#8810;
                                        </button>
                                      </li>
                                      <li
                                        className={`page-item ${
                                          currentPage === 1 ? "disabled" : ""
                                        }`}
                                      >
                                        <button
                                          className="page-link"
                                          onClick={() =>
                                            paginate(currentPage - 1)
                                          }
                                        >
                                          &laquo;
                                        </button>
                                      </li>
                                      {currentPage > 1 && (
                                        <li className="page-item">
                                          <span className="page-link">...</span>
                                        </li>
                                      )}
                                      {Array(totalPages)
                                        .fill()
                                        .map((_, index) => {
                                          if (
                                            index + 1 === currentPage ||
                                            (index + 1 >= currentPage - 1 &&
                                              index + 1 <= currentPage + 1)
                                          ) {
                                            return (
                                              <li
                                                key={index}
                                                className={`page-item ${
                                                  currentPage === index + 1
                                                    ? "active"
                                                    : ""
                                                }`}
                                              >
                                                <button
                                                  className="page-link"
                                                  onClick={() =>
                                                    paginate(index + 1)
                                                  }
                                                >
                                                  {index + 1}
                                                </button>
                                              </li>
                                            );
                                          }
                                        })}
                                      {currentPage < totalPages - 1 && (
                                        <li className="page-item">
                                          <span className="page-link">...</span>
                                        </li>
                                      )}
                                      <li
                                        className={`page-item ${
                                          currentPage === totalPages
                                            ? "disabled"
                                            : ""
                                        }`}
                                      >
                                        <button
                                          className="page-link"
                                          onClick={() =>
                                            paginate(currentPage + 1)
                                          }
                                        >
                                          &raquo;
                                        </button>
                                      </li>
                                      <li
                                        className={`page-item ${
                                          currentPage === totalPages
                                            ? "disabled"
                                            : ""
                                        }`}
                                      >
                                        <button
                                          className="page-link"
                                          onClick={() => paginate(totalPages)}
                                        >
                                          &#8811;
                                        </button>
                                      </li>
                                    </ul>
                                  </nav>
                                </div>
                              </div>
                            </>
                          ) : null
                        ) : null
                        // <div class="d-flex justify-content-center align-items-center w-100 responsive-div" >
                        //     <img width={350} className="scaled-hover-target" src="/images/icon/loading.gif" ></img>
                        // </div>
                        // <div>{lang["not found data"]}</div>
                      }
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default COMPONENT;
