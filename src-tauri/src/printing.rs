// Raw printer access — bypasses the browser's print engine entirely (no
// page-size/margin/dialog handling), sending bytes straight to a named
// Windows printer via the Win32 print spooler in RAW mode. This is how real
// POS software drives thermal printers: ESC/POS command bytes in, printer
// interprets them directly, no HTML/CSS rendering involved.
//
// Windows-only for now (Everycom + Sunphor/TSC are both Windows-connected USB
// thermal printers). Phase 1: just get raw bytes to a named printer and list
// available printers, so this can be tested against the real hardware before
// building the ESC/POS content-formatting layer on top of it.
//
// Uses windows-sys (raw FFI bindings, mirror the Win32 C headers almost
// verbatim) rather than the higher-level `windows` crate — plain fn
// signatures, plain pointers, explicit BOOL checks. No Result-wrapping or
// generic Param<T> ergonomics to get subtly wrong against a pinned version.

#[cfg(target_os = "windows")]
mod imp {
    use std::ffi::c_void;
    use std::ptr;
    use windows_sys::Win32::Foundation::GetLastError;
    use windows_sys::Win32::Graphics::Printing::{
        ClosePrinter, EndDocPrinter, EndPagePrinter, EnumPrintersW, OpenPrinterW,
        StartDocPrinterW, StartPagePrinter, WritePrinter, DOC_INFO_1W, PRINTER_ACCESS_USE,
        PRINTER_DEFAULTSW, PRINTER_ENUM_CONNECTIONS, PRINTER_ENUM_LOCAL, PRINTER_HANDLE,
        PRINTER_INFO_4W,
    };

    fn wide(s: &str) -> Vec<u16> {
        s.encode_utf16().chain(std::iter::once(0)).collect()
    }

    unsafe fn wide_ptr_to_string(p: *mut u16) -> String {
        let mut len = 0isize;
        while *p.offset(len) != 0 {
            len += 1;
        }
        String::from_utf16_lossy(std::slice::from_raw_parts(p, len as usize))
    }

    fn last_error(context: &str) -> String {
        let code = unsafe { GetLastError() };
        format!("{context} (GetLastError = {code})")
    }

    pub fn print_raw(printer_name: &str, data: &[u8]) -> Result<(), String> {
        unsafe {
            let printer_wide = wide(printer_name);
            let mut datatype = wide("RAW");
            let mut defaults = PRINTER_DEFAULTSW {
                pDatatype: datatype.as_mut_ptr(),
                pDevMode: ptr::null_mut(),
                DesiredAccess: PRINTER_ACCESS_USE,
            };

            let mut handle: PRINTER_HANDLE = PRINTER_HANDLE {
                Value: ptr::null_mut(),
            };
            if OpenPrinterW(printer_wide.as_ptr(), &mut handle, &mut defaults) == 0 {
                return Err(last_error(&format!(
                    "OpenPrinter(\"{printer_name}\") failed"
                )));
            }

            let mut doc_name = wide("Kidz Plaza");
            let mut doc_datatype = wide("RAW");
            let doc_info = DOC_INFO_1W {
                pDocName: doc_name.as_mut_ptr(),
                pOutputFile: ptr::null_mut(),
                pDatatype: doc_datatype.as_mut_ptr(),
            };

            let job_id = StartDocPrinterW(handle, 1, &doc_info as *const DOC_INFO_1W);
            if job_id == 0 {
                let err = last_error("StartDocPrinter failed");
                ClosePrinter(handle);
                return Err(err);
            }

            if StartPagePrinter(handle) == 0 {
                let err = last_error("StartPagePrinter failed");
                EndDocPrinter(handle);
                ClosePrinter(handle);
                return Err(err);
            }

            let mut written: u32 = 0;
            let write_ok = WritePrinter(
                handle,
                data.as_ptr() as *const c_void,
                data.len() as u32,
                &mut written,
            );
            let write_err = if write_ok == 0 {
                Some(last_error("WritePrinter failed"))
            } else {
                None
            };

            EndPagePrinter(handle);
            EndDocPrinter(handle);
            ClosePrinter(handle);

            if let Some(e) = write_err {
                return Err(e);
            }
            if written as usize != data.len() {
                return Err(format!(
                    "WritePrinter only wrote {written} of {} bytes",
                    data.len()
                ));
            }
            Ok(())
        }
    }

    pub fn list_printers() -> Result<Vec<String>, String> {
        unsafe {
            let flags = PRINTER_ENUM_LOCAL | PRINTER_ENUM_CONNECTIONS;
            let mut needed: u32 = 0;
            let mut returned: u32 = 0;

            // Sizing call: expected to "fail" (insufficient buffer) but fills `needed`.
            // Level 4 (PRINTER_INFO_4W) is the fast, cheap-enumeration level —
            // just name/server/attributes, no per-printer driver round-trip.
            EnumPrintersW(
                flags,
                ptr::null(),
                4,
                ptr::null_mut(),
                0,
                &mut needed,
                &mut returned,
            );
            if needed == 0 {
                return Ok(vec![]);
            }

            let mut buffer = vec![0u8; needed as usize];
            let ok = EnumPrintersW(
                flags,
                ptr::null(),
                4,
                buffer.as_mut_ptr(),
                needed,
                &mut needed,
                &mut returned,
            );
            if ok == 0 {
                return Err(last_error("EnumPrinters failed"));
            }

            let base = buffer.as_ptr() as *const PRINTER_INFO_4W;
            let mut names = Vec::with_capacity(returned as usize);
            for i in 0..returned as isize {
                let info = &*base.offset(i);
                if !info.pPrinterName.is_null() {
                    names.push(wide_ptr_to_string(info.pPrinterName));
                }
            }
            Ok(names)
        }
    }
}

#[cfg(not(target_os = "windows"))]
mod imp {
    pub fn print_raw(_printer_name: &str, _data: &[u8]) -> Result<(), String> {
        Err("Raw printer access is only implemented on Windows.".into())
    }
    pub fn list_printers() -> Result<Vec<String>, String> {
        Ok(vec![])
    }
}

#[tauri::command]
pub fn print_raw(printer_name: String, data: Vec<u8>) -> Result<(), String> {
    imp::print_raw(&printer_name, &data)
}

#[tauri::command]
pub fn list_printers() -> Result<Vec<String>, String> {
    imp::list_printers()
}
