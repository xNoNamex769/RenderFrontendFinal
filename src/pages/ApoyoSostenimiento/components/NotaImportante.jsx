import React from "react";
import "./styles/NotaImportante.css"

export default function NotaImportante() {
  return (
          <section className="nota-importante-apoyo">
            <div className="container-apoyo">
              <div className="nota-card-apoyo">
                <div className="nota-header-apoyo">
                  <div className="nota-icon-apoyo">⚠️</div>
                  <h3 className="nota-title-apoyo">NOTA IMPORTANTE</h3>
                </div>
                <div className="nota-content-apoyo">
                  <div className="nota-item-apoyo">
                    <span className="nota-number-apoyo">1</span>
                    <p className="nota-text-apoyo">
                      El aprendiz es responsable de realizar su proceso de inscripción a través de la página de Sofía Plus
                      (La inscripción en Sofía Plus es hasta el <strong>7 de julio de 2025</strong>) Completar el formulario
                      y cargar la entrega de la documentación soporte.
                    </p>
                  </div>
                  <div className="nota-item-apoyo">
                    <span className="nota-number-apoyo">2</span>
                    <p className="nota-text-apoyo">
                      Si el aprendiz no envía documentos en el tiempo establecido (desde el momento de la inscripción en
                      Sofía Plus hasta el día <strong>10 de julio de 2025</strong>.) se descarta para proceso de
                      priorización.
                    </p>
                  </div>
                  <div className="nota-item-apoyo">
                    <span className="nota-number-apoyo">3</span>
                    <p className="nota-text-apoyo">
                      Si el aprendiz envía documentos, pero no se inscribe en Sofía Plus, se descarta para priorización.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
  )
}
