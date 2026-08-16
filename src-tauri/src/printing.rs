// Raw printer access — bypasses the browser's print engine entirely (no
// page-size/margin/dialog handling), sending bytes straight to a named
// Windows printer via the Win32 print spooler in RAW mode. This is how real
// POS software drives thermal printers: ESC/POS command bytes in, printer
// interprets them directly, no HTML/CSS rendering involved.
//
// Windows-only for now (Everycom + Sunphor are both Windows-connected USB
// thermal printers). Phase 1: just get raw bytes to a named printer and list
// available printers, so this can be tested against the real hardware before
// building the ESC/POS content-formatting layer on top of it.

#[cfg(target_os = "windows")]
mod imp {
    use std::ffi::c_void;
    use windows::core::{PCWSTR, PWSTR};
    use windows::Win32::Graphics::Printing::{
        ClosePrinter, EndDocPrinter, EndPagePrinter, EnumPrintersW, OpenPrinterW,
        StartDocPrinterW, StartPagePrinter, WritePrinter, DOC_INFO_1W, PRINTER_ENUM_CONNECTIONS,
        PRINTER_ENUM_LOCAL, PRINTER_HANDLE, PRINTER_INFO_2W,
    };

    fn wide(s: &str) -> Vec<u16> {
        s.encode_utf16().chain(std::iter::once(0)).collect()
    }

    pub fn print_raw(printer_name: &str, data: &[u8]) -> Result<(), String> {
        unsafe {
            let printer_wide = wide(printer_name);
            let mut handle = PRINTER_HANDLE::default();
            OpenPrinterW(PCWSTR(printer_wide.as_ptr()), &mut handle, None)
                .map_err(|e| format!("OpenPrinter(\"{printer_name}\") failed: {e}"))?;

            let mut doc_name = wide("Kidz Plaza");
            let mut datatype = wide("RAW");
            let doc_info = DOC_INFO_1W {
                pDocName: PWSTR(doc_name.as_mut_ptr()),
                pOutputFile: PWSTR::null(),
                pDatatype: PWSTR(datatype.as_mut_ptr()),
            };

            let job_id = StartDocPrinterW(handle, 1, &doc_info as *const DOC_INFO_1W as *const _);
            if job_id == 0 {
                let _ = ClosePrinter(handle);
                return Err("StartDocPrinter returned 0 (job not started)".into());
            }

            // StartPagePrinter/EndPagePrinter/EndDocPrinter/ClosePrinter/WritePrinter
            // return BOOL, not Result — `.ok()` is windows-rs's standard BOOL ->
            // Result<(), windows::core::Error> conversion (false = pull last error).
            if let Err(e) = StartPagePrinter(handle).ok() {
                let _ = EndDocPrinter(handle);
                let _ = ClosePrinter(handle);
                return Err(format!("StartPagePrinter failed: {e}"));
            }

            let mut written: u32 = 0;
            let write_result = WritePrinter(
                handle,
                data.as_ptr() as *const c_void,
                data.len() as u32,
                &mut written,
            )
            .ok();

            let _ = EndPagePrinter(handle);
            let _ = EndDocPrinter(handle);
            let _ = ClosePrinter(handle);

            write_result.map_err(|e| format!("WritePrinter failed: {e}"))?;
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
            let _ = EnumPrintersW(flags, PCWSTR::null(), 2, None, &mut needed, &mut returned);
            if needed == 0 {
                return Ok(vec![]);
            }

            let mut buffer = vec![0u8; needed as usize];
            EnumPrintersW(
                flags,
                PCWSTR::null(),
                2,
                Some(&mut buffer),
                &mut needed,
                &mut returned,
            )
            .map_err(|e| format!("EnumPrinters failed: {e}"))?;

            let base = buffer.as_ptr() as *const PRINTER_INFO_2W;
            let mut names = Vec::with_capacity(returned as usize);
            for i in 0..returned as isize {
                let info = &*base.offset(i);
                if !info.pPrinterName.is_null() {
                    if let Ok(name) = info.pPrinterName.to_string() {
                        names.push(name);
                    }
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
