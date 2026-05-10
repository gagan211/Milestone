use milestone::{on_init, on_shut_down};

#[tokio::main]
async fn main() {
    let server = match on_init().await {
        Ok(srv) => {
            println!("Core systems initialized successfully!");
            srv
        }
        Err(e) => {
            eprintln!("Server initialization failed: {}", e);
            std::process::exit(1);
        }
    };

    if let Err(e) = server.run().await {
        eprintln!("Server Runtime error {}", e);
        on_shut_down();
    }
    on_shut_down();
}
