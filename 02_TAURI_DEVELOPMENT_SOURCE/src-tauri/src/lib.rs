#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("Kangnam Notice Guide 실행 중 오류가 발생했습니다.");
}
