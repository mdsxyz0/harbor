use serde_json::Value;
use std::sync::OnceLock;

fn configuration() -> &'static Value {
    static CONFIG: OnceLock<Value> = OnceLock::new();
    CONFIG.get_or_init(|| {
        serde_json::from_str(include_str!("../../src/lib/config/owned-services.json"))
            .expect("owned service configuration must be valid JSON")
    })
}

fn api_base() -> &'static str {
    configuration()["origins"]["api"]
        .as_str()
        .expect("owned service configuration must define the API origin")
        .trim_end_matches('/')
}

pub fn health_url() -> String {
    format!("{}/health", api_base())
}

pub fn asr_model_url() -> Option<String> {
    configuration()["capabilities"]["models"]
        .as_bool()
        .filter(|enabled| *enabled)
        .map(|_| format!("{}/models/ggml-tiny.bin", api_base()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn native_configuration_matches_the_client_contract() {
        assert_eq!(configuration()["schemaVersion"], 1);
        assert!(health_url().starts_with("https://"));
        assert!(health_url().ends_with("/health"));
    }

    #[test]
    fn absent_model_service_has_no_download_target() {
        assert_eq!(configuration()["capabilities"]["models"], false);
        assert!(asr_model_url().is_none());
    }
}
