use axum::Router;
use tokio::net::TcpListener;

pub struct HttpServer {
    listner: TcpListener,
    router: Router,
}

impl HttpServer {
    pub fn new(listner: TcpListener, router: Router) -> Self {
        Self { listner, router }
    }

    pub async fn run(self) -> Result<(), std::io::Error> {
        let addr = self.listner.local_addr()?;
        println!("sevrer started on http://{}", addr);
        axum::serve(self.listner, self.router)
            .with_graceful_shutdown(Self::shutdown_signal())
            .await?;
        Ok(())
    }
    // This function asynchronously waits until Ctrl+C (SIGINT) or SIGTERM is triggered
    async fn shutdown_signal() {
        let ctrl_c = async {
            tokio::signal::ctrl_c()
                .await
                .expect("failed to install Ctrl+C handler");
        };
        #[cfg(unix)]
        let terminate = async {
            tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
                .expect("failed to install signal handler")
                .recv()
                .await;
        };
        #[cfg(not(unix))]
        let terminate = std::future::pending::<()>();
        tokio::select! {
            _ = ctrl_c => {},
            _ = terminate => {},
        }
        println!("\n🛑 Shutdown signal received! Beginning graceful termination...");
    }
}
